import { Request, Response, NextFunction } from 'express';
import { caseService } from '../services/caseService';
import { eventService } from '../services/eventService';
import { sendCaseToHappyRobot } from '../services/happyRobotService';
import { z } from 'zod';

// Validation schemas
const createCaseSchema = z.object({
  codigoSC: z.string().min(1, 'Código SC is required'),
  dniCif: z.string().min(1, 'DNI/CIF is required'),
  nombreApellidos: z.string().min(1, 'Nombre is required'),
  cups: z.string().min(1, 'CUPS is required'),
  contratoNC: z.string().min(1, 'Contrato NC is required'),
  lineaNegocio: z.string().min(1, 'Línea de negocio is required'),
  direccionCompleta: z.string().min(1, 'Dirección is required'),
  codigoPostal: z.string().min(1, 'Código postal is required'),
  municipio: z.string().min(1, 'Municipio is required'),
  provincia: z.string().min(1, 'Provincia is required'),
  ccaa: z.string().min(1, 'CCAA is required'),
  distribuidora: z.string().min(1, 'Distribuidora is required'),
  grupoDistribuidora: z.string().min(1, 'Grupo distribuidora is required'),
  emailContacto: z.string().email('Invalid email'),
  telefonoContacto: z.string().min(1, 'Teléfono is required'),
  proceso: z.string().min(1, 'Proceso is required'),
  potenciaActual: z.string().optional(),
  potenciaSolicitada: z.string().optional(),
  status: z.enum(['In progress', 'Revisar gestor', 'Cancelar SC']).optional(),
  emailThreadId: z.string().optional(),
  fechaPrimerContacto: z.string().or(z.date()),
  duplicateMode: z.enum(['append', 'overwrite']).optional(),
});

const updateCaseSchema = createCaseSchema.partial().omit({ codigoSC: true });

export const casesController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, search, limit, offset } = req.query;

      const result = await caseService.getAllCases({
        status: typeof status === 'string' ? status : undefined,
        search: typeof search === 'string' ? search : undefined,
        limit: typeof limit === 'string' ? parseInt(limit) : undefined,
        offset: typeof offset === 'string' ? parseInt(offset) : undefined,
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const codigoSC = req.params.codigoSC as string;
      const caseItem = await caseService.getCaseByCodigoSC(codigoSC);
      res.json(caseItem);
    } catch (error) {
      next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { duplicateMode = 'append', ...caseData } = createCaseSchema.parse(req.body);
      const validatedData = caseData;
      
      // Check if case already exists
      let existingCase;
      let isNewCase = false;
      try {
        existingCase = await caseService.getCaseByCodigoSC(validatedData.codigoSC);
        
        // Handle duplicate based on mode
        if (duplicateMode === 'overwrite') {
          console.log(`🔄 Case ${validatedData.codigoSC} already exists, overwriting...`);
          existingCase = await caseService.updateCase(validatedData.codigoSC, validatedData);
        } else {
          console.log(`ℹ️  Case ${validatedData.codigoSC} already exists, will append events`);
        }
      } catch (error) {
        // Case doesn't exist, create it
        isNewCase = true;
        existingCase = await caseService.createCase(validatedData);
        console.log(`✅ Created new case ${validatedData.codigoSC}`);
      }
      
      // Send case to HappyRobot webhook (fail-safe: don't block if webhook fails)
      try {
        const happyrobotRunId = await sendCaseToHappyRobot(validatedData);
        
        // Save HappyRobot run ID to case if received
        if (happyrobotRunId) {
          await caseService.updateCase(validatedData.codigoSC, { happyrobotRunId });
          console.log(`✅ HappyRobot run ID saved: ${happyrobotRunId}`);
        }
        
        // Create init event in timeline after successful webhook call
        await eventService.createEvent({
          caseId: validatedData.codigoSC,
          type: 'happyrobot_init',
          description: `Automatización iniciada en HappyRobot${duplicateMode === 'overwrite' && !isNewCase ? ' (caso sobrescrito)' : ''}`,
          metadata: {
            proceso: validatedData.proceso,
            duplicateMode: duplicateMode,
            happyrobotRunId: happyrobotRunId || undefined,
            happyrobotUrl: happyrobotRunId 
              ? `https://v2.platform.happyrobot.ai/naturgy-v2/workflow/8w6vk54dcqbg/runs?run_id=${happyrobotRunId}`
              : undefined,
            timestamp: new Date().toISOString(),
          },
        });
      } catch (webhookError) {
        console.error('⚠️  HappyRobot webhook failed, but case was created:', {
          codigoSC: validatedData.codigoSC,
          error: webhookError instanceof Error ? webhookError.message : 'Unknown error',
        });
        // Continue - don't fail the request if webhook fails
      }
      
      // Return the case with fresh data (including new events)
      const finalCase = await caseService.getCaseByCodigoSC(validatedData.codigoSC);
      res.status(isNewCase ? 201 : 200).json(finalCase);
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

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const codigoSC = req.params.codigoSC as string;
      const validatedData = updateCaseSchema.parse(req.body);
      const updatedCase = await caseService.updateCase(codigoSC, validatedData);
      res.json(updatedCase);
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

  async updateThreadId(req: Request, res: Response, next: NextFunction) {
    try {
      const codigoSC = req.params.codigoSC as string;
      const { emailThreadId } = z.object({
        emailThreadId: z.string().min(1, 'Email thread ID is required'),
      }).parse(req.body);

      const updatedCase = await caseService.updateCase(codigoSC, { emailThreadId });
      res.json(updatedCase);
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
      const codigoSC = req.params.codigoSC as string;
      await caseService.deleteCase(codigoSC);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await caseService.getStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  },
};
