import { query } from '../lib/db';

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
    let queryText = `
      SELECT 
        c.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', e.id,
              'caseId', e.case_id,
              'type', e.type,
              'description', e.description,
              'metadata', e.metadata,
              'timestamp', e.timestamp
            ) ORDER BY e.timestamp DESC
          ) FILTER (WHERE e.id IS NOT NULL),
          '[]'::json
        ) as events
      FROM rejection_cases c
      LEFT JOIN case_events e ON c.codigo_sc = e.case_id
    `;

    const conditions: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    if (filters?.status) {
      conditions.push(`c.status = $${paramCount}`);
      params.push(filters.status);
      paramCount++;
    }

    if (filters?.search) {
      conditions.push(`(
        c.codigo_sc ILIKE $${paramCount} OR
        c.nombre_apellidos ILIKE $${paramCount} OR
        c.cups ILIKE $${paramCount} OR
        c.proceso ILIKE $${paramCount}
      )`);
      params.push(`%${filters.search}%`);
      paramCount++;
    }

    if (conditions.length > 0) {
      queryText += ` WHERE ${conditions.join(' AND ')}`;
    }

    queryText += ` GROUP BY c.id ORDER BY c.created_at DESC`;

    if (filters?.limit) {
      queryText += ` LIMIT $${paramCount}`;
      params.push(filters.limit);
      paramCount++;
    }

    if (filters?.offset) {
      queryText += ` OFFSET $${paramCount}`;
      params.push(filters.offset);
    }

    const result = await query(queryText, params);

    // Count total
    let countQuery = 'SELECT COUNT(*) FROM rejection_cases c';
    const countParams: any[] = [];
    let countParamCount = 1;

    if (conditions.length > 0) {
      if (filters?.status) {
        countParams.push(filters.status);
        countParamCount++;
      }
      if (filters?.search) {
        countParams.push(`%${filters.search}%`);
      }
      countQuery += ` WHERE ${conditions.join(' AND ')}`;
    }

    const countResult = await query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    return {
      cases: result.rows.map(mapDatabaseRowToCase),
      total,
    };
  },

  async getCaseByCodigoSC(codigoSC: string) {
    const result = await query(
      `
      SELECT 
        c.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', e.id,
              'caseId', e.case_id,
              'type', e.type,
              'description', e.description,
              'metadata', e.metadata,
              'timestamp', e.timestamp
            ) ORDER BY e.timestamp DESC
          ) FILTER (WHERE e.id IS NOT NULL),
          '[]'::json
        ) as events
      FROM rejection_cases c
      LEFT JOIN case_events e ON c.codigo_sc = e.case_id
      WHERE c.codigo_sc = $1
      GROUP BY c.id
      `,
      [codigoSC]
    );

    if (result.rows.length === 0) {
      throw new Error('Case not found');
    }

    return mapDatabaseRowToCase(result.rows[0]);
  },

  async createCase(data: CreateCaseInput) {
    const result = await query(
      `
      INSERT INTO rejection_cases (
        codigo_sc, dni_cif, nombre_apellidos, cups, contrato_nc, linea_negocio,
        direccion_completa, codigo_postal, municipio, provincia, ccaa,
        distribuidora, grupo_distribuidora, email_contacto, telefono_contacto,
        proceso, potencia_actual, potencia_solicitada, status, email_thread_id,
        fecha_primer_contacto
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21
      )
      RETURNING *
      `,
      [
        data.codigoSC,
        data.dniCif,
        data.nombreApellidos,
        data.cups,
        data.contratoNC,
        data.lineaNegocio,
        data.direccionCompleta,
        data.codigoPostal,
        data.municipio,
        data.provincia,
        data.ccaa,
        data.distribuidora,
        data.grupoDistribuidora,
        data.emailContacto,
        data.telefonoContacto,
        data.proceso,
        data.potenciaActual || null,
        data.potenciaSolicitada || null,
        data.status || 'In progress',
        data.emailThreadId || null,
        new Date(data.fechaPrimerContacto),
      ]
    );

    const caseRow = result.rows[0];
    return mapDatabaseRowToCase({ ...caseRow, events: [] });
  },

  async updateCase(codigoSC: string, data: UpdateCaseInput) {
    const fields: string[] = [];
    const params: any[] = [];
    let paramCount = 1;

    const fieldMap: Record<string, string> = {
      dniCif: 'dni_cif',
      nombreApellidos: 'nombre_apellidos',
      cups: 'cups',
      contratoNC: 'contrato_nc',
      lineaNegocio: 'linea_negocio',
      direccionCompleta: 'direccion_completa',
      codigoPostal: 'codigo_postal',
      municipio: 'municipio',
      provincia: 'provincia',
      ccaa: 'ccaa',
      distribuidora: 'distribuidora',
      grupoDistribuidora: 'grupo_distribuidora',
      emailContacto: 'email_contacto',
      telefonoContacto: 'telefono_contacto',
      proceso: 'proceso',
      potenciaActual: 'potencia_actual',
      potenciaSolicitada: 'potencia_solicitada',
      status: 'status',
      emailThreadId: 'email_thread_id',
      fechaPrimerContacto: 'fecha_primer_contacto',
    };

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbField = fieldMap[key];
        if (dbField) {
          fields.push(`${dbField} = $${paramCount}`);
          params.push(key === 'fechaPrimerContacto' ? new Date(value as string) : value);
          paramCount++;
        }
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    params.push(codigoSC);

    const result = await query(
      `
      UPDATE rejection_cases
      SET ${fields.join(', ')}
      WHERE codigo_sc = $${paramCount}
      RETURNING *
      `,
      params
    );

    if (result.rows.length === 0) {
      throw new Error('Case not found');
    }

    // Get with events
    return await this.getCaseByCodigoSC(codigoSC);
  },

  async deleteCase(codigoSC: string) {
    const result = await query(
      'DELETE FROM rejection_cases WHERE codigo_sc = $1 RETURNING *',
      [codigoSC]
    );

    if (result.rows.length === 0) {
      throw new Error('Case not found');
    }

    return result.rows[0];
  },

  async getStats() {
    const totalResult = await query('SELECT COUNT(*) FROM rejection_cases');
    const inProgressResult = await query(
      "SELECT COUNT(*) FROM rejection_cases WHERE status = 'In progress'"
    );
    const pendingActionResult = await query(
      "SELECT COUNT(*) FROM rejection_cases WHERE status IN ('Revisar gestor', 'Cancelar SC')"
    );
    const byStatusResult = await query(
      'SELECT status, COUNT(*) as count FROM rejection_cases GROUP BY status'
    );

    return {
      total: parseInt(totalResult.rows[0].count),
      inProgress: parseInt(inProgressResult.rows[0].count),
      pendingAction: parseInt(pendingActionResult.rows[0].count),
      byStatus: byStatusResult.rows.map((row: any) => ({
        status: row.status,
        count: parseInt(row.count),
      })),
    };
  },
};

function mapDatabaseRowToCase(row: any) {
  return {
    id: row.id,
    codigoSC: row.codigo_sc,
    dniCif: row.dni_cif,
    nombreApellidos: row.nombre_apellidos,
    cups: row.cups,
    contratoNC: row.contrato_nc,
    lineaNegocio: row.linea_negocio,
    direccionCompleta: row.direccion_completa,
    codigoPostal: row.codigo_postal,
    municipio: row.municipio,
    provincia: row.provincia,
    ccaa: row.ccaa,
    distribuidora: row.distribuidora,
    grupoDistribuidora: row.grupo_distribuidora,
    emailContacto: row.email_contacto,
    telefonoContacto: row.telefono_contacto,
    proceso: row.proceso,
    potenciaActual: row.potencia_actual,
    potenciaSolicitada: row.potencia_solicitada,
    status: row.status,
    emailThreadId: row.email_thread_id,
    fechaPrimerContacto: row.fecha_primer_contacto,
    events: Array.isArray(row.events) ? row.events : [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
