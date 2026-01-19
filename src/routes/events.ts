import { Router } from 'express';
import { eventsController } from '../controllers/eventsController';

const router = Router();

// GET /api/events/:eventId
router.get('/:eventId', eventsController.getOne);

// POST /api/events/:eventId/delete
router.post('/:eventId/delete', eventsController.delete);

export default router;
