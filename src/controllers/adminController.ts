import { Request, Response, NextFunction } from 'express';
import { query } from '../lib/db';
import fs from 'fs';
import path from 'path';

export const adminController = {
  async resetDatabase(req: Request, res: Response, next: NextFunction) {
    try {
      console.log('🔄 Database reset requested...');
      
      // Read the init.sql file
      const sqlPath = path.join(__dirname, '../db/init.sql');
      const sql = fs.readFileSync(sqlPath, 'utf8');
      
      // Execute the SQL script
      await query(sql);
      
      console.log('✅ Database reset successfully!');
      
      res.json({
        success: true,
        message: 'Database reset successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('❌ Database reset failed:', error);
      next(error);
    }
  },
};
