import { query } from '../lib/db';

export interface CreateEventInput {
  caseId: string; // codigoSC del caso
  type: 'happyrobot_init' | 'email_not_found' | 'call_sent' | 'email_sent' | 'wait_24h' | 'wait_48h' | 'wait_72h' | 'email_received_with_attachment' | 'email_received_no_attachment' | 'needs_assistance';
  description: string;
  metadata?: Record<string, any>;
  timestamp?: Date;
}

export const eventService = {
  async getEventsByCase(caseId: string) {
    const result = await query(
      `
      SELECT * FROM case_events
      WHERE case_id = $1
      ORDER BY timestamp DESC
      `,
      [caseId]
    );

    return result.rows.map(mapDatabaseRowToEvent);
  },

  async getEventById(eventId: string) {
    const result = await query(
      `
      SELECT 
        e.*,
        row_to_json(c.*) as case
      FROM case_events e
      LEFT JOIN rejection_cases c ON e.case_id = c.codigo_sc
      WHERE e.id = $1
      `,
      [eventId]
    );

    if (result.rows.length === 0) {
      throw new Error('Event not found');
    }

    return mapDatabaseRowToEvent(result.rows[0]);
  },

  async createEvent(data: CreateEventInput) {
    // Check if case exists
    const caseCheck = await query(
      'SELECT codigo_sc FROM rejection_cases WHERE codigo_sc = $1',
      [data.caseId]
    );

    if (caseCheck.rows.length === 0) {
      throw new Error('Case not found');
    }

    const result = await query(
      `
      INSERT INTO case_events (case_id, type, description, metadata, timestamp)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [
        data.caseId,
        data.type,
        data.description,
        data.metadata ? JSON.stringify(data.metadata) : null,
        data.timestamp || new Date(),
      ]
    );

    return mapDatabaseRowToEvent(result.rows[0]);
  },

  async deleteEvent(eventId: string) {
    const result = await query(
      'DELETE FROM case_events WHERE id = $1 RETURNING *',
      [eventId]
    );

    if (result.rows.length === 0) {
      throw new Error('Event not found');
    }

    return mapDatabaseRowToEvent(result.rows[0]);
  },
};

function mapDatabaseRowToEvent(row: any) {
  return {
    id: row.id,
    caseId: row.case_id,
    type: row.type,
    description: row.description,
    metadata: row.metadata,
    timestamp: row.timestamp,
    ...(row.case && { case: row.case }),
  };
}
