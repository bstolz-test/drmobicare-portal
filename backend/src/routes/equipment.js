import express from 'express';
import pool from '../db.js';
import { authMiddleware, requireRole } from '../auth.js';

const router = express.Router();

// Get equipment inventory
router.get('/inventory', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, et.name as type_name, et.category,
             u.first_name, u.last_name, u.email
      FROM equipment e
      LEFT JOIN equipment_types et ON e.type_id = et.id
      LEFT JOIN users u ON e.assigned_to = u.id
      ORDER BY e.created_at DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Add equipment type
router.post('/types', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    const { name, category, description } = req.body;

    const result = await pool.query(
      'INSERT INTO equipment_types (name, category, description) VALUES ($1, $2, $3) RETURNING *',
      [name, category, description]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create equipment type' });
  }
});

// Add equipment
router.post('/', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    const { type_id, serial_number, prey_code } = req.body;

    const result = await pool.query(
      `INSERT INTO equipment (type_id, serial_number, prey_code, status)
       VALUES ($1, $2, $3, 'in_stock')
       RETURNING *`,
      [type_id, serial_number, prey_code]
    );

    res.json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Serial number already exists' });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to add equipment' });
  }
});

// Assign equipment to user (procurement)
router.post('/assign', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    const { equipment_id, user_id, notes } = req.body;

    const equipmentResult = await pool.query(
      'SELECT * FROM equipment WHERE id = $1',
      [equipment_id]
    );

    if (equipmentResult.rows.length === 0) {
      return res.status(404).json({ error: 'Equipment not found' });
    }

    // Update equipment status
    await pool.query(
      'UPDATE equipment SET assigned_to = $1, status = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [user_id, 'assigned', equipment_id]
    );

    // Create assignment record
    const assignResult = await pool.query(
      `INSERT INTO equipment_assignments (equipment_id, user_id, notes)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [equipment_id, user_id, notes]
    );

    res.json({
      message: 'Equipment assigned',
      assignment: assignResult.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to assign equipment' });
  }
});

// Update equipment status (shipment tracking)
router.put('/:id/status', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    const { status, tracking_number, docusign_status } = req.body;
    const { id } = req.params;

    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (status) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }
    if (docusign_status) {
      updates.push(`docusign_status = $${paramIndex++}`);
      values.push(docusign_status);
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await pool.query(
      `UPDATE equipment_assignments SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Get equipment for user
router.get('/user/:userId', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT e.*, et.name as type_name, ea.shipment_status, ea.tracking_number, 
             ea.docusign_status, ea.notes, ea.assigned_date
      FROM equipment e
      JOIN equipment_types et ON e.type_id = et.id
      LEFT JOIN equipment_assignments ea ON e.id = ea.equipment_id
      WHERE e.assigned_to = $1
      ORDER BY ea.assigned_date DESC
    `, [req.params.userId]);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch equipment' });
  }
});

export default router;
