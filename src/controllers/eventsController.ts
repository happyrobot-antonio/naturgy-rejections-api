import { Request, Response, NextFunction } from 'express';
import { eventService } from '../services/eventService';
import { z } from 'zod';

const createEventSchema = z.object({
  type: z.enum([
    'happyrobot_init',
    'email_not_found',
    'call_sent',
    'email_sent',
    'wait_24h',
    'wait_48h',
    'wait_72h',
    'email_received_with_attachment',
    'email_received_no_attachment',
    'needs_assistance',
  ]),
  description: z.string().min(1, 'Description is required'),
  metadata: z.record(z.string(), z.any()).optional(),
  timestamp: z.string().or(z.date()).optional(),
});

export const eventsController = {
  async getByCase(req: Request, res: Response, next: NextFunction) {
    try {
      const codigoSC = req.params.codigoSC as string;
      const events = await eventService.getEventsByCase(codigoSC);
      res.json(events);
    } catch (error) {
      next(error);
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.eventId as string;
      const event = await eventService.getEventById(eventId);
      res.json(event);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const codigoSC = req.params.codigoSC as string;
      const validatedData = createEventSchema.parse(req.body);
      
      const newEvent = await eventService.createEvent({
        caseId: codigoSC,
        ...validatedData,
        timestamp: validatedData.timestamp ? new Date(validatedData.timestamp) : undefined,
      });

      res.status(201).json(newEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation error',
          details: error.issues,
        });
      }
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const eventId = req.params.eventId as string;
      await eventService.deleteEvent(eventId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
};
