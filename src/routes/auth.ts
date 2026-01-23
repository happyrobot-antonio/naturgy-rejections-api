import { Router, Request, Response } from 'express';

const router = Router();

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Validar contraseña de acceso
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *             required:
 *               - password
 *     responses:
 *       200:
 *         description: Contraseña válida
 *       401:
 *         description: Contraseña incorrecta
 */
router.post('/login', (req: Request, res: Response) => {
  const { password } = req.body;
  
  const validPassword = process.env.DASHBOARD_PASSWORD;
  
  if (!validPassword) {
    console.error('DASHBOARD_PASSWORD env variable not set');
    return res.status(500).json({ error: 'Server configuration error' });
  }
  
  if (password === validPassword) {
    return res.json({ success: true });
  }
  
  return res.status(401).json({ error: 'Contraseña incorrecta' });
});

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     tags: [Auth]
 *     summary: Verificar si la contraseña guardada es válida
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               password:
 *                 type: string
 *             required:
 *               - password
 *     responses:
 *       200:
 *         description: Contraseña válida
 *       401:
 *         description: Contraseña incorrecta
 */
router.post('/verify', (req: Request, res: Response) => {
  const { password } = req.body;
  
  const validPassword = process.env.DASHBOARD_PASSWORD;
  
  if (!validPassword) {
    return res.status(500).json({ error: 'Server configuration error' });
  }
  
  if (password === validPassword) {
    return res.json({ valid: true });
  }
  
  return res.status(401).json({ valid: false });
});

export default router;
