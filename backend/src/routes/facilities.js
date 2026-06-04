import express from 'express';
import pool from '../db.js';
import { authMiddleware, requireRole } from '../auth.js';
import { encrypt, decrypt } from '../encryption.js';

const router = express.Router();

// Add facility
router.post('/facilities', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    const {
      name, address, city, state, zip_code, phone, fax,
      pcc_username, pcc_password, sigma_account, sigma_password,
      point_of_contact, contact_phone, progress_notes_recipient,
      progress_notes_email, market_state, entity_id
    } = req.body;

    const encryptedPccPassword = pcc_password ? encrypt(pcc_password) : null;
    const encryptedSigmaPassword = sigma_password ? encrypt(sigma_password) : null;

    const result = await pool.query(
      `INSERT INTO facilities 
       (name, address, city, state, zip_code, phone, fax, 
        pcc_username, pcc_password, sigma_account, sigma_password,
        point_of_contact, contact_phone, progress_notes_recipient,
        progress_notes_email, market_state, entity_id, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, 'active')
       RETURNING *`,
      [name, address, city, state, zip_code, phone, fax,
       pcc_username, encryptedPccPassword, sigma_account, encryptedSigmaPassword,
       point_of_contact, contact_phone, progress_notes_recipient,
       progress_notes_email, market_state, entity_id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create facility' });
  }
});

// Get all facilities
router.get('/facilities', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, address, city, state, zip_code, phone, fax,
              pcc_username, point_of_contact, contact_phone, 
              progress_notes_recipient, progress_notes_email, status
       FROM facilities WHERE status = 'active'
       ORDER BY state, name ASC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch facilities' });
  }
});

// Get facility with decrypted credentials (admin only)
router.get('/facilities/:id', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM facilities WHERE id = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Facility not found' });
    }

    const facility = result.rows[0];
    if (facility.pcc_password) {
      facility.pcc_password = decrypt(facility.pcc_password);
    }
    if (facility.sigma_password) {
      facility.sigma_password = decrypt(facility.sigma_password);
    }

    res.json(facility);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch facility' });
  }
});

// Add schedule
router.post('/schedules', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    const { user_id, facility_id, day_of_week, start_time, end_time, notes } = req.body;

    const result = await pool.query(
      `INSERT INTO schedules (user_id, facility_id, day_of_week, start_time, end_time, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, facility_id, day_of_week)
       DO UPDATE SET start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, 
                      notes = EXCLUDED.notes, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [user_id, facility_id, day_of_week, start_time, end_time, notes]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

// Get schedules for provider
router.get('/schedules/user/:userId', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, f.name as facility_name, f.city, f.state
       FROM schedules s
       JOIN facilities f ON s.facility_id = f.id
       WHERE s.user_id = $1
       ORDER BY CASE s.day_of_week
         WHEN 'Monday' THEN 1
         WHEN 'Tuesday' THEN 2
         WHEN 'Wednesday' THEN 3
         WHEN 'Thursday' THEN 4
         WHEN 'Friday' THEN 5
         ELSE 6
       END`,
      [req.params.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

// Get all schedules (for admin view)
router.get('/schedules', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, f.name as facility_name, u.first_name, u.last_name
       FROM schedules s
       JOIN facilities f ON s.facility_id = f.id
       JOIN users u ON s.user_id = u.id
       ORDER BY u.first_name, u.last_name, 
                CASE s.day_of_week
                  WHEN 'Monday' THEN 1
                  WHEN 'Tuesday' THEN 2
                  WHEN 'Wednesday' THEN 3
                  WHEN 'Thursday' THEN 4
                  WHEN 'Friday' THEN 5
                  ELSE 6
                END`
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch schedules' });
  }
});

export default router;
