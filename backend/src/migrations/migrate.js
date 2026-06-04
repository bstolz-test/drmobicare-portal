import pool from '../db.js';
import { createTablesSQL } from '../schema.js';

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Starting database migration...');
    await client.query(createTablesSQL);
    console.log('Database schema created successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

migrate().then(() => {
  console.log('Migration completed');
  process.exit(0);
}).catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
