import { Router } from 'express';
import { adminController } from '../controllers/adminController';

const router = Router();

/**
 * @swagger
 * /api/admin/reset-db:
 *   post:
 *     tags: [Admin]
 *     summary: Reiniciar base de datos
 *     description: Elimina todos los datos y reinicializa el schema de la base de datos
 *     responses:
 *       200:
 *         description: Base de datos reinicializada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Database reset successfully
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       500:
 *         description: Error al reiniciar la base de datos
 */
router.post('/reset-db', adminController.resetDatabase);

export default router;
