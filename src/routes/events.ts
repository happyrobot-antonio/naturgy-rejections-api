import { Router } from 'express';
import { eventsController } from '../controllers/eventsController';

const router = Router();

/**
 * @swagger
 * /api/events/{eventId}:
 *   get:
 *     tags: [Events]
 *     summary: Obtener un evento específico
 *     description: Obtiene los detalles de un evento por su ID
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del evento
 *     responses:
 *       200:
 *         description: Evento encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Evento no encontrado
 */
router.get('/:eventId', eventsController.getOne);

/**
 * @swagger
 * /api/events/{eventId}/delete:
 *   post:
 *     tags: [Events]
 *     summary: Eliminar un evento
 *     description: Elimina un evento del timeline de un caso
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID del evento a eliminar
 *     responses:
 *       204:
 *         description: Evento eliminado exitosamente
 *       404:
 *         description: Evento no encontrado
 */
router.post('/:eventId/delete', eventsController.delete);

export default router;
