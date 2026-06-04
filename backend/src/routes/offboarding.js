import express from 'express';
import pool from '../db.js';
import { authMiddleware, requireRole } from '../auth.js';

const router = express.Router();

const OFFBOARDING_STEPS = {
  provider: [
    'Termination letter sent', 'Last working day confirmed', 'Relias removed',
    'EMR access removed', 'Email termination initiated', 'Group email removal',
    'Paycom termination', 'Timeero deactivation', 'WoundWise deactivation',
    'Equipment return initiated', 'Equipment tracking numbers collected',
    'Malpractice insurance termination', 'Collaborating doc cancelled',
    'Birthday calendar removal', 'Billing notified', 'Intake notified',
    'Credentialing notified', 'Procurement notified', 'Equipment fully returned',
    'Final documentation archived', 'Exit interview conducted'
  ],
  medical_assistant: [
    'Termination letter sent', 'Last working day confirmed', 'Relias removed',
    'EMR access removed', 'Email termination initiated', 'Group email removal',
    'Paycom termination', 'Timeero deactivation', 'Equipment return initiated',
    'Equipment tracking numbers collected', 'Birthday calendar removal',
    'Intake notified', 'Procurement notified', 'Equipment fully returned',
    'Final documentation archived', 'Exit interview conducted'
  ],
  admin: [
    'Termination letter sent', 'Last working day confirmed', 'Equipment return initiated',
    'Email termination initiated', 'Group email removal', 'Paycom termination',
    'EMR access removed', 'Timeero deactivation', 'Ring Central removal',
    'PVerify access removed (if applicable)', 'Prey device deactivation',
    'Equipment tracking numbers collected', 'Intake notified',
    'Procurement notified', 'Equipment fully returned',
    'Final documentation archived', 'Exit interview conducted'
  ]
};

// Initiate offboarding
router.post('/', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    const { user_id, department, reason, last_day_of_work } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create offboarding checklist
      const checklistResult = await client.query(
        `INSERT INTO offboarding_checklists (user_id, department, reason, last_day_of_work, status)
         VALUES ($1, $2, $3, $4, 'in_progress')
         RETURNING *`,
        [user_id, department, reason, last_day_of_work]
      );

      const checklistId = checklistResult.rows[0].id;
      const steps = OFFBOARDING_STEPS[department] || [];

      // Add steps
      for (const step of steps) {
        await client.query(
          `INSERT INTO offboarding_steps (offboarding_id, step_name, required)
           VALUES ($1, $2, true)`,
          [checklistId, step]
        );
      }

      await client.query('COMMIT');

      res.json({
        message: 'Offboarding initiated',
        checklist_id: checklistId,
        last_day_of_work: last_day_of_work
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to initiate offboarding' });
  }
});

// Get offboarding checklist
router.get('/:checklistId', authMiddleware, async (req, res) => {
  try {
    const checklistResult = await pool.query(
      'SELECT * FROM offboarding_checklists WHERE id = $1',
      [req.params.checklistId]
    );

    if (checklistResult.rows.length === 0) {
      return res.status(404).json({ error: 'Checklist not found' });
    }

    const stepsResult = await pool.query(
      `SELECT * FROM offboarding_steps 
       WHERE offboarding_id = $1 
       ORDER BY id ASC`,
      [req.params.checklistId]
    );

    res.json({
      checklist: checklistResult.rows[0],
      steps: stepsResult.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch checklist' });
  }
});

// Mark step complete
router.put('/step/:stepId/complete', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    const { notes, completed_by } = req.body;

    const result = await pool.query(
      `UPDATE offboarding_steps 
       SET completed = true, completed_date = CURRENT_TIMESTAMP, notes = $1, completed_by = $2
       WHERE id = $3
       RETURNING *`,
      [notes, completed_by, req.params.stepId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Step not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update step' });
  }
});

// Get offboarding for employee
router.get('/employee/:userId', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, COUNT(s.id) as total_steps, 
              SUM(CASE WHEN s.completed THEN 1 ELSE 0 END) as completed_steps
       FROM offboarding_checklists c
       LEFT JOIN offboarding_steps s ON c.id = s.offboarding_id
       WHERE c.user_id = $1
       GROUP BY c.id
       ORDER BY c.initiated_date DESC
       LIMIT 1`,
      [req.params.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No offboarding found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch offboarding' });
  }
});

export default router;
