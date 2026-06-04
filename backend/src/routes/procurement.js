import express from 'express';
import pool from '../db.js';
import { authMiddleware, requireRole } from '../auth.js';
import { encrypt, decrypt } from '../encryption.js';

const router = express.Router();

// Create procurement order
router.post('/orders', authMiddleware, async (req, res) => {
  try {
    const { office_id, items, notes } = req.body;
    
    const orderResult = await pool.query(
      `INSERT INTO procurement_orders (user_id, office_id, notes)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.user.userId, office_id, notes]
    );

    const orderId = orderResult.rows[0].id;

    for (const item of items) {
      await pool.query(
        `INSERT INTO procurement_order_items (order_id, product_id, quantity, unit_price, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [orderId, item.product_id, item.quantity, item.unit_price, item.quantity * item.unit_price]
      );
    }

    res.json({
      message: 'Order created',
      order_id: orderId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get all orders (admin) or user orders
router.get('/orders', authMiddleware, async (req, res) => {
  try {
    let query = `
      SELECT o.*, u.first_name, u.last_name, off.name as office_name
      FROM procurement_orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN offices off ON o.office_id = off.id
    `;
    let params = [];

    if (req.user.role !== 'admin') {
      query += ' WHERE o.user_id = $1';
      params.push(req.user.userId);
    }

    query += ' ORDER BY o.order_date DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Get order details
router.get('/orders/:orderId', authMiddleware, async (req, res) => {
  try {
    const orderResult = await pool.query(
      'SELECT * FROM procurement_orders WHERE id = $1',
      [req.params.orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const itemsResult = await pool.query(
      `SELECT poi.*, p.name, p.category
       FROM procurement_order_items poi
       JOIN products p ON poi.product_id = p.id
       WHERE poi.order_id = $1`,
      [req.params.orderId]
    );

    res.json({
      order: orderResult.rows[0],
      items: itemsResult.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Get products catalog
router.get('/products', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products ORDER BY category, name ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Add product
router.post('/products', authMiddleware, requireRole(['admin']), async (req, res) => {
  try {
    const { name, category, description, mckesson_id, unit_price, image_url } = req.body;

    const result = await pool.query(
      `INSERT INTO products (name, category, description, mckesson_id, unit_price, image_url)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, category, description, mckesson_id, unit_price, image_url]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Password vault - add credential
router.post('/vault', authMiddleware, async (req, res) => {
  try {
    const { title, username, password, url, notes } = req.body;

    const encryptedPassword = encrypt(password);

    const result = await pool.query(
      `INSERT INTO password_vault (user_id, title, username, encrypted_password, url, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, title, username, url, notes, created_at`,
      [req.user.userId, title, username, encryptedPassword, url, notes]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save credential' });
  }
});

// Password vault - get credentials
router.get('/vault', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, username, url, notes, created_at, updated_at
       FROM password_vault
       WHERE user_id = $1
       ORDER BY title ASC`,
      [req.user.userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch credentials' });
  }
});

// Password vault - get single credential (with decrypted password)
router.get('/vault/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM password_vault
       WHERE id = $1 AND user_id = $2`,
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    const cred = result.rows[0];
    cred.password = decrypt(cred.encrypted_password);
    delete cred.encrypted_password;

    res.json(cred);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch credential' });
  }
});

// Password vault - delete credential
router.delete('/vault/:id', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM password_vault
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [req.params.id, req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    res.json({ message: 'Credential deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete credential' });
  }
});

export default router;
