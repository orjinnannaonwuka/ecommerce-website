import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const database = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

database.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export { database };
