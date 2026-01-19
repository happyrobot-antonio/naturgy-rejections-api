import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

export interface CreateCaseInput {
  codigoSC: string;
  dniCif: string;
  nombreApellidos: string;
  cups: string;
  contratoNC: string;
  lineaNegocio: string;
  direccionCompleta: string;
  codigoPostal: string;
  municipio: string;
  provincia: string;
  ccaa: string;
  distribuidora: string;
  grupoDistribuidora: string;
  emailContacto: string;
  telefonoContacto: string;
  proceso: string;
  potenciaActual?: string;
  potenciaSolicitada?: string;
  status?: string;
  emailThreadId?: string;
  fechaPrimerContacto: string | Date;
}

export interface UpdateCaseInput {
  dniCif?: string;
  nombreApellidos?: string;
  cups?: string;
  contratoNC?: string;
  lineaNegocio?: string;
  direccionCompleta?: string;
  codigoPostal?: string;
  municipio?: string;
  provincia?: string;
  ccaa?: string;
  distribuidora?: string;
  grupoDistribuidora?: string;
  emailContacto?: string;
  telefonoContacto?: string;
  proceso?: string;
  potenciaActual?: string;
  potenciaSolicitada?: string;
  status?: string;
  emailThreadId?: string;
  fechaPrimerContacto?: string | Date;
}

export const caseService = {
  async getAllCases(filters?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: Prisma.RejectionCaseWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { codigoSC: { contains: filters.search, mode: 'insensitive' } },
        { nombreApellidos: { contains: filters.search, mode: 'insensitive' } },
        { cups: { contains: filters.search, mode: 'insensitive' } },
        { proceso: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [cases, total] = await Promise.all([
      prisma.rejectionCase.findMany({
        where,
        include: {
          events: {
            orderBy: { timestamp: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: filters?.limit,
        skip: filters?.offset,
      }),
      prisma.rejectionCase.count({ where }),
    ]);

    return { cases, total };
  },

  async getCaseByCodigoSC(codigoSC: string) {
    const caseItem = await prisma.rejectionCase.findUnique({
      where: { codigoSC },
      include: {
        events: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });

    if (!caseItem) {
      throw new Error('Case not found');
    }

    return caseItem;
  },

  async createCase(data: CreateCaseInput) {
    return await prisma.rejectionCase.create({
      data: {
        ...data,
        fechaPrimerContacto: new Date(data.fechaPrimerContacto),
      },
      include: {
        events: true,
      },
    });
  },

  async updateCase(codigoSC: string, data: UpdateCaseInput) {
    const updateData: any = { ...data };
    
    if (data.fechaPrimerContacto) {
      updateData.fechaPrimerContacto = new Date(data.fechaPrimerContacto);
    }

    return await prisma.rejectionCase.update({
      where: { codigoSC },
      data: updateData,
      include: {
        events: {
          orderBy: { timestamp: 'desc' },
        },
      },
    });
  },

  async deleteCase(codigoSC: string) {
    return await prisma.rejectionCase.delete({
      where: { codigoSC },
    });
  },

  async getStats() {
    const [total, inProgress, pendingAction] = await Promise.all([
      prisma.rejectionCase.count(),
      prisma.rejectionCase.count({ where: { status: 'In progress' } }),
      prisma.rejectionCase.count({
        where: {
          status: { in: ['Revisar gestor', 'Cancelar SC'] },
        },
      }),
    ]);

    const byStatus = await prisma.rejectionCase.groupBy({
      by: ['status'],
      _count: true,
    });

    return {
      total,
      inProgress,
      pendingAction,
      byStatus: byStatus.map(item => ({
        status: item.status,
        count: item._count,
      })),
    };
  },
};
