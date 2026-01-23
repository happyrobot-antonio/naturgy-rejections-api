import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Analytics
 *   description: Analytics and business metrics endpoints
 */

/**
 * @swagger
 * /api/analytics/overview:
 *   get:
 *     tags: [Analytics]
 *     summary: Obtener métricas generales
 *     description: Devuelve un resumen completo de métricas de automatización, comunicación, casos y eficiencia
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de inicio del período (opcional, por defecto 30 días atrás)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Fecha de fin del período (opcional, por defecto hoy)
 *     responses:
 *       200:
 *         description: Métricas generales
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 automation:
 *                   type: object
 *                   properties:
 *                     hoursSaved:
 *                       type: number
 *                       description: Horas ahorradas por automatización
 *                     automationRate:
 *                       type: number
 *                       description: Porcentaje de casos automatizados
 *                     casesProcessed:
 *                       type: number
 *                       description: Número de casos procesados
 *                     costSavings:
 *                       type: number
 *                       description: Ahorro estimado en euros
 *                 communication:
 *                   type: object
 *                   properties:
 *                     totalEmails:
 *                       type: object
 *                       properties:
 *                         sent:
 *                           type: number
 *                         received:
 *                           type: number
 *                     totalCalls:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         reached:
 *                           type: number
 *                         notReached:
 *                           type: number
 *                         needsHelp:
 *                           type: number
 *                     avgResponseTime:
 *                       type: number
 *                       description: Tiempo promedio de respuesta en horas
 *                     callSuccessRate:
 *                       type: number
 *                       description: Porcentaje de llamadas exitosas
 *                 cases:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     resolved:
 *                       type: number
 *                     resolutionRate:
 *                       type: number
 *                     avgResolutionTime:
 *                       type: number
 *                       description: Tiempo promedio de resolución en días
 *                     byStatus:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           status:
 *                             type: string
 *                           count:
 *                             type: number
 *                 efficiency:
 *                   type: object
 *                   properties:
 *                     eventsPerCase:
 *                       type: number
 *                     retryRate:
 *                       type: number
 *                     reviewRate:
 *                       type: number
 *                     avgWaitTime:
 *                       type: number
 *                       description: Tiempo promedio de espera en horas
 */
router.get('/overview', analyticsController.getOverview);

/**
 * @swagger
 * /api/analytics/trends:
 *   get:
 *     tags: [Analytics]
 *     summary: Obtener tendencias de casos
 *     description: Devuelve datos de series temporales para visualizar tendencias
 *     parameters:
 *       - in: query
 *         name: period
 *         required: true
 *         schema:
 *           type: string
 *           enum: [7d, 30d, 90d]
 *         description: Período de tiempo
 *     responses:
 *       200:
 *         description: Datos de tendencias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     format: date
 *                   cases:
 *                     type: number
 *       400:
 *         description: Período inválido
 */
router.get('/trends', analyticsController.getTrends);

/**
 * @swagger
 * /api/analytics/distribution:
 *   get:
 *     tags: [Analytics]
 *     summary: Obtener distribuciones
 *     description: Devuelve distribuciones de eventos, geográfica, por proceso y distribuidora
 *     responses:
 *       200:
 *         description: Datos de distribución
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 eventTypes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                       count:
 *                         type: number
 *                 geographic:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       region:
 *                         type: string
 *                       count:
 *                         type: number
 *                 processTypes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       process:
 *                         type: string
 *                       count:
 *                         type: number
 *                 distributors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       distributor:
 *                         type: string
 *                       count:
 *                         type: number
 */
router.get('/distribution', analyticsController.getDistribution);

export default router;
