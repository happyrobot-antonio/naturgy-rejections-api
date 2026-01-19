import { Router } from 'express';
import { casesController } from '../controllers/casesController';
import { eventsController } from '../controllers/eventsController';

const router = Router();

// GET /api/cases/stats - Must be before /:codigoSC
router.get('/stats', casesController.getStats);

// GET /api/cases
router.get('/', casesController.getAll);

// GET /api/cases/:codigoSC
router.get('/:codigoSC', casesController.getOne);

// POST /api/cases
router.post('/', casesController.create);

// PUT /api/cases/:codigoSC
router.put('/:codigoSC', casesController.update);

// DELETE /api/cases/:codigoSC
router.delete('/:codigoSC', casesController.delete);

// Nested events routes
// GET /api/cases/:codigoSC/events
router.get('/:codigoSC/events', eventsController.getByCase);

// POST /api/cases/:codigoSC/events
router.post('/:codigoSC/events', eventsController.create);

export default router;
