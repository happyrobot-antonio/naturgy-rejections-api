import { readFileSync } from 'fs';
import { join } from 'path';
import pool from '../lib/db';

async function initializeDatabase() {
  try {
    console.log('🔄 Initializing database schema...');
    
    // Try both dist and src paths
    let sqlPath = join(__dirname, 'init.sql');
    try {
      readFileSync(sqlPath, 'utf-8');
    } catch {
      // If not in dist, try src
      sqlPath = join(process.cwd(), 'src', 'db', 'init.sql');
    }
    
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
