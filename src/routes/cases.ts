import { Router } from 'express';
import { casesController } from '../controllers/casesController';
import { eventsController } from '../controllers/eventsController';

const router = Router();

/**
 * @swagger
 * /api/cases/stats:
 *   get:
 *     tags: [Cases]
 *     summary: Obtener estadísticas de casos
 *     description: Devuelve estadísticas agregadas de todos los casos
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: number
 *                   example: 100
 *                 inProgress:
 *                   type: number
 *                   example: 60
 *                 pendingAction:
 *                   type: number
 *                   example: 40
 *                 byStatus:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       status:
 *                         type: string
 *                       count:
 *                         type: number
 */
router.get('/stats', casesController.getStats);

/**
 * @swagger
 * /api/cases:
 *   get:
 *     tags: [Cases]
 *     summary: Listar todos los casos
 *     description: Obtiene una lista de todos los casos con filtros opcionales
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [In progress, Revisar gestor, Cancelar SC]
 *         description: Filtrar por estado
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por código SC, nombre, CUPS o proceso
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Número de resultados por página
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *         description: Offset para paginación
 *     responses:
 *       200:
 *         description: Lista de casos obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cases:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Case'
 *                 total:
 *                   type: number
 */
router.get('/', casesController.getAll);

/**
 * @swagger
 * /api/cases/thread/{threadId}:
 *   get:
 *     tags: [Cases]
 *     summary: Buscar caso por email thread ID
 *     description: Busca si existe un caso asociado a un thread ID específico de email
 *     parameters:
 *       - in: path
 *         name: threadId
 *         required: true
 *         schema:
 *           type: string
 *         description: Email thread ID
 *         example: thread-abc123xyz
 *     responses:
 *       200:
 *         description: Caso encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 found:
 *                   type: boolean
 *                   example: true
 *                 case:
 *                   $ref: '#/components/schemas/Case'
 *       404:
 *         description: No se encontró caso con ese thread ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 found:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: No case found with this thread ID
 *                 threadId:
 *                   type: string
 *                   example: thread-abc123xyz
 */
router.get('/thread/:threadId', casesController.getByThreadId);

/**
 * @swagger
 * /api/cases/{codigoSC}:
 *   get:
 *     tags: [Cases]
 *     summary: Obtener un caso específico
 *     description: Obtiene los detalles completos de un caso incluyendo sus eventos
 *     parameters:
 *       - in: path
 *         name: codigoSC
 *         required: true
 *         schema:
 *           type: string
 *         description: Código SC del caso
 *     responses:
 *       200:
 *         description: Caso encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Case'
 *       404:
 *         description: Caso no encontrado
 */
router.get('/:codigoSC', casesController.getOne);

/**
 * @swagger
 * /api/cases:
 *   post:
 *     tags: [Cases]
 *     summary: Crear un nuevo caso o agregar eventos a uno existente
 *     description: Crea un nuevo caso y envía datos a HappyRobot. Si el caso ya existe, agrega un nuevo evento al timeline.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCaseInput'
 *     responses:
 *       201:
 *         description: Caso nuevo creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Case'
 *       200:
 *         description: Caso existente, evento agregado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Case'
 *       400:
 *         description: Error de validación
 */
router.post('/', casesController.create);

/**
 * @swagger
 * /api/cases/{codigoSC}/update:
 *   post:
 *     tags: [Cases]
 *     summary: Actualizar un caso existente
 *     description: Actualiza los datos de un caso (usado para cambiar status principalmente)
 *     parameters:
 *       - in: path
 *         name: codigoSC
 *         required: true
 *         schema:
 *           type: string
 *         description: Código SC del caso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [In progress, Revisar gestor, Cancelar SC, Relanzar SC]
 *                 example: Revisar gestor
 *     responses:
 *       200:
 *         description: Caso actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Case'
 *       404:
 *         description: Caso no encontrado
 */
router.post('/:codigoSC/update', casesController.update);

/**
 * @swagger
 * /api/cases/{codigoSC}/thread:
 *   post:
 *     tags: [Cases]
 *     summary: Actualizar email thread ID de un caso
 *     description: Actualiza el identificador del hilo de email asociado al caso
 *     parameters:
 *       - in: path
 *         name: codigoSC
 *         required: true
 *         schema:
 *           type: string
 *         description: Código SC del caso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - emailThreadId
 *             properties:
 *               emailThreadId:
 *                 type: string
 *                 example: thread-abc123xyz
 *                 description: ID del hilo de email
 *     responses:
 *       200:
 *         description: Thread ID actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Case'
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Caso no encontrado
 */
router.post('/:codigoSC/thread', casesController.updateThreadId);

/**
 * @swagger
 * /api/cases/{codigoSC}/delete:
 *   post:
 *     tags: [Cases]
 *     summary: Eliminar un caso
 *     description: Elimina permanentemente un caso y todos sus eventos asociados
 *     parameters:
 *       - in: path
 *         name: codigoSC
 *         required: true
 *         schema:
 *           type: string
 *         description: Código SC del caso
 *     responses:
 *       204:
 *         description: Caso eliminado exitosamente
 *       404:
 *         description: Caso no encontrado
 */
router.post('/:codigoSC/delete', casesController.delete);

/**
 * @swagger
 * /api/cases/{codigoSC}/events:
 *   get:
 *     tags: [Events]
 *     summary: Obtener eventos de un caso
 *     description: Lista todos los eventos del timeline de un caso específico
 *     parameters:
 *       - in: path
 *         name: codigoSC
 *         required: true
 *         schema:
 *           type: string
 *         description: Código SC del caso
 *     responses:
 *       200:
 *         description: Lista de eventos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 */
router.get('/:codigoSC/events', eventsController.getByCase);

/**
 * @swagger
 * /api/cases/{codigoSC}/events:
 *   post:
 *     tags: [Events]
 *     summary: Crear un evento en el timeline
 *     description: Agrega un nuevo evento al timeline de un caso
 *     parameters:
 *       - in: path
 *         name: codigoSC
 *         required: true
 *         schema:
 *           type: string
 *         description: Código SC del caso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEventInput'
 *     responses:
 *       201:
 *         description: Evento creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Caso no encontrado
 */
router.post('/:codigoSC/events', eventsController.create);

/**
 * @swagger
 * components:
 *   schemas:
 *     Case:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *         codigoSC:
 *           type: string
 *           example: SC-2024-001
 *         dniCif:
 *           type: string
 *         nombreApellidos:
 *           type: string
 *         cups:
 *           type: string
 *         contratoNC:
 *           type: string
 *         lineaNegocio:
 *           type: string
 *         direccionCompleta:
 *           type: string
 *         codigoPostal:
 *           type: string
 *         municipio:
 *           type: string
 *         provincia:
 *           type: string
 *         ccaa:
 *           type: string
 *         distribuidora:
 *           type: string
 *         grupoDistribuidora:
 *           type: string
 *         emailContacto:
 *           type: string
 *         telefonoContacto:
 *           type: string
 *         proceso:
 *           type: string
 *         potenciaActual:
 *           type: string
 *         potenciaSolicitada:
 *           type: string
 *         status:
 *           type: string
 *           enum: [In progress, Revisar gestor, Cancelar SC, Relanzar SC]
 *         emailThreadId:
 *           type: string
 *         fechaPrimerContacto:
 *           type: string
 *           format: date-time
 *         happyrobotRunId:
 *           type: string
 *           description: UUID del proceso en HappyRobot
 *         happyrobotUrl:
 *           type: string
 *           description: URL de seguimiento del proceso en HappyRobot
 *         events:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Event'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     CreateCaseInput:
 *       type: object
 *       required:
 *         - codigoSC
 *         - dniCif
 *         - nombreApellidos
 *         - cups
 *         - contratoNC
 *         - lineaNegocio
 *         - direccionCompleta
 *         - codigoPostal
 *         - municipio
 *         - provincia
 *         - ccaa
 *         - distribuidora
 *         - grupoDistribuidora
 *         - emailContacto
 *         - telefonoContacto
 *         - proceso
 *         - fechaPrimerContacto
 *       properties:
 *         codigoSC:
 *           type: string
 *         dniCif:
 *           type: string
 *         nombreApellidos:
 *           type: string
 *         cups:
 *           type: string
 *         contratoNC:
 *           type: string
 *         lineaNegocio:
 *           type: string
 *         direccionCompleta:
 *           type: string
 *         codigoPostal:
 *           type: string
 *         municipio:
 *           type: string
 *         provincia:
 *           type: string
 *         ccaa:
 *           type: string
 *         distribuidora:
 *           type: string
 *         grupoDistribuidora:
 *           type: string
 *         emailContacto:
 *           type: string
 *           format: email
 *         telefonoContacto:
 *           type: string
 *         proceso:
 *           type: string
 *         potenciaActual:
 *           type: string
 *         potenciaSolicitada:
 *           type: string
 *         status:
 *           type: string
 *           enum: [In progress, Revisar gestor, Cancelar SC]
 *         emailThreadId:
 *           type: string
 *         fechaPrimerContacto:
 *           type: string
 *           format: date
 *         duplicateMode:
 *           type: string
 *           enum: [append, overwrite]
 *           description: Modo de gestión de duplicados - 'append' agrega eventos, 'overwrite' sobrescribe el caso completo
 *           default: append
 *     Event:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         caseId:
 *           type: string
 *         type:
 *           type: string
 *           enum: [happyrobot_init, email_not_found, call_sent, email_sent, wait_24h, wait_48h, wait_72h, email_received_with_attachment, email_received_no_attachment]
 *         description:
 *           type: string
 *         metadata:
 *           type: object
 *         timestamp:
 *           type: string
 *           format: date-time
 *     CreateEventInput:
 *       type: object
 *       required:
 *         - type
 *         - description
 *       properties:
 *         type:
 *           type: string
 *           enum: [happyrobot_init, email_not_found, call_sent, email_sent, wait_24h, wait_48h, wait_72h, email_received_with_attachment, email_received_no_attachment, needs_assistance]
 *         description:
 *           type: string
 *         metadata:
 *           type: object
 */

export default router;
