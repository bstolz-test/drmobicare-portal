import express from 'express';
import pool from '../db.js';
import { authMiddleware, requireRole } from '../auth.js';

const router = express.Router();

// Hiring/firing statistics
router.get('/turnover', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = `
      SELECT 
        DATE_TRUNC('month', termination_date)::date as month,
        COUNT(*) as total_terminations,
        SUM(CASE WHEN voluntary THEN 1 ELSE 0 END) as voluntary,
        SUM(CASE WHEN NOT voluntary THEN 1 ELSE 0 END) as involuntary,
        position,
        COUNT(DISTINCT entity_id) as entities
      FROM turnover_records
    `;

    const params = [];

    if (startDate && endDate) {
      query += ` WHERE termination_date >= $1 AND termination_date <= $2`;
      params.push(startDate, endDate);
    }

    query += ` GROUP BY month, position ORDER BY month DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch turnover data' });
  }
});

// Order analytics
router.get('/orders', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    const { startDate, endDate, userId } = req.query;

    let query = `
      SELECT 
        DATE(o.order_date) as order_date,
        u.first_name, u.last_name, u.id as user_id,
        p.category,
        p.name as product_name,
        SUM(poi.quantity) as total_quantity,
        SUM(poi.subtotal) as total_cost
      FROM procurement_orders o
      JOIN users u ON o.user_id = u.id
      JOIN procurement_order_items poi ON o.id = poi.order_id
      JOIN products p ON poi.product_id = p.id
    `;

    const params = [];
    const conditions = [];

    if (startDate && endDate) {
      conditions.push(`o.order_date >= $${params.length + 1} AND o.order_date <= $${params.length + 2}`);
      params.push(startDate, endDate);
    }

    if (userId) {
      conditions.push(`o.user_id = $${params.length + 1}`);
      params.push(userId);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` GROUP BY DATE(o.order_date), u.id, p.category, p.name ORDER BY order_date DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch order analytics' });
  }
});

// Product spending
router.get('/spending', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = `
      SELECT 
        p.category,
        p.name,
        SUM(poi.quantity) as total_ordered,
        SUM(poi.subtotal) as total_cost,
        COUNT(DISTINCT o.id) as order_count
      FROM procurement_order_items poi
      JOIN products p ON poi.product_id = p.id
      JOIN procurement_orders o ON poi.order_id = o.id
    `;

    const params = [];

    if (startDate && endDate) {
      query += ` WHERE o.order_date >= $1 AND o.order_date <= $2`;
      params.push(startDate, endDate);
    }

    query += ` GROUP BY p.category, p.name ORDER BY total_cost DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch spending data' });
  }
});

// Employee metrics
router.get('/employees', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        department,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive,
        COUNT(CASE WHEN status = 'offboarded' THEN 1 END) as offboarded
      FROM users
      GROUP BY department
      ORDER BY department
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch employee metrics' });
  }
});

export default router;
