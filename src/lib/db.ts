import { Pool, PoolClient } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Test connection
pool.on('connect', () => {
  console.log('📦 Connected to PostgreSQL database');
});

pool.on('error', (err: Error) => {
  console.error('❌ PostgreSQL connection error:', err);
  process.exit(-1);
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  
  if (process.env.LOG_QUERIES === 'true') {
    console.log('Query executed:', { text, duration, rows: res.rowCount });
  }
  
  return res;
};

export const getClient = (): Promise<PoolClient> => {
  return pool.connect();
};

export default pool;
