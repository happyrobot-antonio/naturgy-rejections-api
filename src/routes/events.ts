import { Router } from 'express';
import { eventsController } from '../controllers/eventsController';

const router = Router();

// GET /api/events/:eventId
router.get('/:eventId', eventsController.getOne);

// DELETE /api/events/:eventId
router.delete('/:eventId', eventsController.delete);

export default router;
