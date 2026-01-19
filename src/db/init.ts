import { readFileSync } from 'fs';
import { join } from 'path';
import pool from '../lib/db';

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database schema...');
    
    const sqlPath = join(__dirname, 'init.sql');
    const sql = readFileSync(sqlPath, 'utf-8');
    
    await pool.query(sql);
    
    console.log('✅ Database schema initialized successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  }
}

initializeDatabase();
