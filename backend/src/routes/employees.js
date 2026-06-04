import express from 'express';
import pool from '../db.js';
import { hashPassword, authMiddleware, requireRole } from '../auth.js';

const router = express.Router();

// Create new employee (admin only)
router.post('/', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    const {
      username,
      email,
      first_name,
      last_name,
      password,
      personal_email,
      phone_number,
      home_address,
      department,
      position,
      state,
      entity_id,
      office_id,
      reports_to,
      start_date,
      is_clinical_admin
    } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password required' });
    }

    const hashedPassword = await hashPassword(password);
    const role = department === 'provider' ? 'provider' : 'office';

    const result = await pool.query(
      `INSERT INTO users 
       (username, email, password, first_name, last_name, personal_email, phone_number, 
        home_address, department, position, state, entity_id, office_id, reports_to, 
        start_date, is_clinical_admin, role, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
       RETURNING id, username, email, first_name, last_name, department, position`,
      [username, email, hashedPassword, first_name, last_name, personal_email, phone_number,
       home_address, department, position, state, entity_id, office_id, reports_to,
       start_date, is_clinical_admin || false, role, 'active']
    );

    res.json({
      message: 'Employee created successfully',
      employee: result.rows[0]
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Username or email already exists' });
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to create employee' });
  }
});

// Get all employees
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, first_name, last_name, department, position, 
              phone_number, state, entity_id, office_id, status, start_date
       FROM users WHERE status != 'offboarded' ORDER BY first_name ASC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch employees' });
  }
});

// Get single employee
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM users WHERE id = $1`,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const user = result.rows[0];
    delete user.password;

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch employee' });
  }
});

// Update employee
router.put('/:id', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      personal_email,
      phone_number,
      home_address,
      department,
      position,
      state,
      entity_id,
      office_id,
      reports_to,
      is_clinical_admin
    } = req.body;

    const result = await pool.query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, personal_email = $3, phone_number = $4,
           home_address = $5, department = $6, position = $7, state = $8,
           entity_id = $9, office_id = $10, reports_to = $11, is_clinical_admin = $12,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $13
       RETURNING id, username, email, first_name, last_name, department, position`,
      [first_name, last_name, personal_email, phone_number, home_address, department,
       position, state, entity_id, office_id, reports_to, is_clinical_admin || false, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ message: 'Employee updated', employee: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update employee' });
  }
});

export default router;
