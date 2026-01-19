import prisma from '../lib/prisma';

export interface CreateEventInput {
  caseId: string; // codigoSC del caso
  type: 'email_sent' | 'call_initiated' | 'email_received_with_attachment' | 'email_received_no_attachment';
  description: string;
  metadata?: Record<string, any>;
  timestamp?: Date;
}

export const eventService = {
  async getEventsByCase(caseId: string) {
    return await prisma.caseEvent.findMany({
      where: { caseId },
      orderBy: { timestamp: 'desc' },
    });
  },

  async getEventById(eventId: string) {
    const event = await prisma.caseEvent.findUnique({
      where: { id: eventId },
      include: {
        case: true,
      },
    });

    if (!event) {
      throw new Error('Event not found');
    }

    return event;
  },

  async createEvent(data: CreateEventInput) {
    // Verificar que el caso existe
    const caseExists = await prisma.rejectionCase.findUnique({
      where: { codigoSC: data.caseId },
    });

    if (!caseExists) {
      throw new Error('Case not found');
    }

    return await prisma.caseEvent.create({
      data: {
        caseId: data.caseId,
        type: data.type,
        description: data.description,
        metadata: data.metadata as any || null,
        timestamp: data.timestamp || new Date(),
      },
      include: {
        case: true,
      },
    });
  },

  async deleteEvent(eventId: string) {
    return await prisma.caseEvent.delete({
      where: { id: eventId },
    });
  },
};
