import { Request, Response, NextFunction } from 'express';
import { analyticsService } from '../services/analyticsService';

export const analyticsController = {
  async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;

      const dateRange = {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      };

      const overview = await analyticsService.getOverview(dateRange);
      res.json(overview);
    } catch (error) {
      next(error);
    }
  },

  async getTrends(req: Request, res: Response, next: NextFunction) {
    try {
      const period = (req.query.period as '7d' | '30d' | '90d') || '30d';
      
      if (!['7d', '30d', '90d'].includes(period)) {
        return res.status(400).json({ error: 'Invalid period. Must be 7d, 30d, or 90d' });
      }

      const trends = await analyticsService.getTrends(period);
      res.json(trends);
    } catch (error) {
      next(error);
    }
  },

  async getDistribution(req: Request, res: Response, next: NextFunction) {
    try {
      const distribution = await analyticsService.getDistribution();
      res.json(distribution);
    } catch (error) {
      next(error);
    }
  },
};
