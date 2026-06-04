import express from 'express';
import pool from '../db.js';
import { authMiddleware, requireRole } from '../auth.js';

const router = express.Router();

const ONBOARDING_STEPS = {
  provider: [
    'Job offer form sent', 'Welcome email sent', 'Offer letter sent',
    'Laptop procurement', 'Paycom setup', 'Onboarding packet sent',
    'Credentialing process', 'PCC access setup', 'WoundWise training',
    'Malpractice insurance', 'Collaborating doc created', 'Company email setup',
    'Group email lists', 'Timeero setup', 'EMR access', 'Relias training',
    'Supply bag prepared', 'Lab coat issued', 'ID badge created',
    'Moleculight ordered', 'Doppler ordered', 'ABI device ordered',
    'Office assignment', 'Equipment acceptance form', 'Welcome packet',
    'Contact directory', 'Virtual background setup', 'Moleculight training',
    'Doppler training', 'ABI training', 'Facility orientation',
    'Documentation review', 'Background check', 'References verified',
    'Start date confirmed', 'Manager assigned', 'Onboarding complete'
  ],
  medical_assistant: [
    'Job offer form sent', 'Welcome email sent', 'Offer letter sent',
    'Laptop procurement', 'Paycom setup', 'Onboarding packet sent',
    'ABI training', 'Company email setup', 'Group email lists',
    'Timeero setup', 'EMR access', 'Relias training',
    'Lab coat issued', 'ID badge created', 'Moleculight ordered',
    'Doppler ordered', 'ABI device ordered', 'Office assignment',
    'Equipment acceptance form', 'Welcome packet', 'Contact directory',
    'Virtual background setup', 'Moleculight training', 'Doppler training',
    'Facility orientation', 'Documentation review', 'Background check',
    'References verified', 'Start date confirmed', 'Manager assigned'
  ],
  admin: [
    'Job offer form sent', 'Welcome email sent', 'Offer letter sent',
    'Laptop procurement', 'Paycom setup', 'Ring Central setup',
    'Group email lists (billing, HQ, intake)', 'Timeero setup', 'EMR access',
    'Equipment acceptance form', 'Relias training', 'Welcome packet',
    'Contact directory', 'VPN setup', 'Office assignment',
    'Manager assigned', 'Documentation review', 'Background check',
    'References verified', 'Start date confirmed', 'Onboarding complete'
  ]
};

// Create onboarding checklist
router.post('/', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    const { user_id, department } = req.body;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Create checklist
      const checklistResult = await client.query(
        `INSERT INTO onboarding_checklists (user_id, department, status)
         VALUES ($1, $2, 'in_progress')
         RETURNING *`,
        [user_id, department]
      );

      const checklistId = checklistResult.rows[0].id;
      const steps = ONBOARDING_STEPS[department] || [];

      // Add steps
      for (const step of steps) {
        await client.query(
          `INSERT INTO onboarding_steps (checklist_id, step_name, required)
           VALUES ($1, $2, true)`,
          [checklistId, step]
        );
      }

      await client.query('COMMIT');

      res.json({
        message: 'Onboarding checklist created',
        checklist_id: checklistId
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create onboarding' });
  }
});

// Get onboarding checklist
router.get('/:checklistId', authMiddleware, async (req, res) => {
  try {
    const checklistResult = await pool.query(
      'SELECT * FROM onboarding_checklists WHERE id = $1',
      [req.params.checklistId]
    );

    if (checklistResult.rows.length === 0) {
      return res.status(404).json({ error: 'Checklist not found' });
    }

    const stepsResult = await pool.query(
      `SELECT * FROM onboarding_steps 
       WHERE checklist_id = $1 
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
      `UPDATE onboarding_steps 
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

// Get onboarding for employee
router.get('/employee/:userId', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.*, COUNT(s.id) as total_steps, 
              SUM(CASE WHEN s.completed THEN 1 ELSE 0 END) as completed_steps
       FROM onboarding_checklists c
       LEFT JOIN onboarding_steps s ON c.id = s.checklist_id
       WHERE c.user_id = $1
       GROUP BY c.id
       ORDER BY c.created_at DESC
       LIMIT 1`,
      [req.params.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No onboarding found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch onboarding' });
  }
});

export default router;
