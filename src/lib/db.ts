import { Pool, PoolClient } from 'pg';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Clean DATABASE_URL - remove Prisma-specific schema parameter
const cleanDatabaseUrl = process.env.DATABASE_URL?.split('?')[0];

console.log('🔄 Connecting to PostgreSQL:', cleanDatabaseUrl?.replace(/:[^:@]+@/, ':****@'));

const pool = new Pool({
  connectionString: cleanDatabaseUrl,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', (client) => {
  console.log('📦 Connected to PostgreSQL database');
});

pool.on('error', (err: Error, client) => {
  console.error('❌ PostgreSQL pool error:', err);
  console.error('Stack:', err.stack);
});

export const query = async (text: string, params?: any[]) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (process.env.LOG_QUERIES === 'true') {
      console.log('Query executed:', { text, duration, rows: res.rowCount });
    }
    
    return res;
  } catch (error) {
    console.error('❌ Query error:', error);
    console.error('Query text:', text);
    console.error('Params:', params);
    throw error;
  }
};

export const getClient = (): Promise<PoolClient> => {
  return pool.connect();
};

export default pool;
