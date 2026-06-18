import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
});

async function dropAll() {
  const client = await pool.connect();
  try {
    await client.query(`
      DROP SCHEMA public CASCADE;
      CREATE SCHEMA public;
      GRANT ALL ON SCHEMA public TO postgres;
      GRANT ALL ON SCHEMA public TO public;
    `);
    console.log('Successfully dropped all tables and recreated public schema.');
  } catch (err) {
    console.error('Error dropping tables:', err);
  } finally {
    client.release();
    pool.end();
  }
}

dropAll();
