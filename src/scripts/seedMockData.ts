import { query } from '../lib/db';

// Generate a fake UUID for HappyRobot
const generateFakeUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const mockCases = [
  // === 10 CASOS EN "REVISAR GESTOR" ===
  {
    codigoSC: 'SC-2024-101',
    dniCif: '12345678A',
    nombreApellidos: 'Laura Fernández García',
    cups: 'ES0021000000000101LF',
    contratoNC: 'NC-101-2024',
    lineaNegocio: 'Electricidad',
    direccionCompleta: 'Calle Gran Vía 45, 2A',
    codigoPostal: '28013',
    municipio: 'Madrid',
    provincia: 'Madrid',
    ccaa: 'Madrid',
    distribuidora: 'UFD',
    grupoDistribuidora: 'Naturgy',
    emailContacto: 'laura.fernandez@email.com',
    telefonoContacto: '+34 600 101 101',
    proceso: 'M1 - Alta de suministro',
    potenciaActual: '3.45',
    potenciaSolicitada: '5.75',
    status: 'Revisar gestor',
    happyrobotRunId: generateFakeUUID(),
    events: [
      { type: 'email_sent', title: 'Email inicial enviado', description: 'Solicitud de documentación', metadata: {}, timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { type: 'call', title: 'Llamada no contestada', description: 'Buzón de voz', metadata: { callStatus: 'Not reached' }, timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      { type: 'needs_review', title: 'Requiere revisión manual', description: 'No se pudo contactar al cliente', metadata: {}, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    ],
  },
  {
    codigoSC: 'SC-2024-102',
    dniCif: '23456789B',
    nombreApellidos: 'Miguel Ángel Torres',
    cups: 'ES0021000000000102MT',
    contratoNC: 'NC-102-2024',
    lineaNegocio: 'Gas',
    direccionCompleta: 'Paseo de Gracia 78, 4B',
    codigoPostal: '08008',
    municipio: 'Barcelona',
    provincia: 'Barcelona',
    ccaa: 'Cataluña',
    distribuidora: 'Nedgia',
    grupoDistribuidora: 'Naturgy',
    emailContacto: 'miguel.torres@email.com',
    telefonoContacto: '+34 600 102 102',
    proceso: 'M2 - Cambio de titular',
    status: 'Revisar gestor',
    happyrobotRunId: generateFakeUUID(),
    events: [
      { type: 'email_sent', title: 'Email inicial', description: 'Cambio de titular solicitado', metadata: {}, timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
      { type: 'incoming_email', title: 'Documentación parcial', description: 'Falta escritura de propiedad', metadata: {}, timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { type: 'needs_review', title: 'Documentación incompleta', description: 'Cliente no responde a solicitud de documentos adicionales', metadata: {}, timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000) },
    ],
  },
  {
    codigoSC: 'SC-2024-103',
    dniCif: '34567890C',
    nombreApellidos: 'Carmen Ruiz Martín',
    cups: 'ES0021000000000103CR',
    contratoNC: 'NC-103-2024',
    lineaNegocio: 'Electricidad',
    direccionCompleta: 'Avenida del Puerto 12, 1C',
    codigoPostal: '46021',
    municipio: 'Valencia',
    provincia: 'Valencia',
    ccaa: 'Comunidad Valenciana',
    distribuidora: 'UFD',
    grupoDistribuidora: 'Naturgy',
    emailContacto: 'carmen.ruiz@email.com',
    telefonoContacto: '+34 600 103 103',
    proceso: 'M3 - Modificación de potencia',
    potenciaActual: '4.6',
    potenciaSolicitada: '9.2',
    status: 'Revisar gestor',
    happyrobotRunId: generateFakeUUID(),
    events: [
      { type: 'email_sent', title: 'Solicitud enviada', description: 'Aumento de potencia', metadata: {}, timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      { type: 'call', title: 'Llamada realizada', description: 'Cliente necesita más información', metadata: { callStatus: 'Needs help' }, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { type: 'needs_review', title: 'Cliente indeciso', description: 'Necesita confirmar cambio de potencia', metadata: {}, timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000) },
    ],
  },
  {
    codigoSC: 'SC-2024-104',
    dniCif: '45678901D',
    nombreApellidos: 'Francisco Javier López',
    cups: 'ES0021000000000104FL',
    contratoNC: 'NC-104-2024',
    lineaNegocio: 'Gas',
    direccionCompleta: 'Calle Sierpes 34, 3D',
    codigoPostal: '41004',
    municipio: 'Sevilla',
    provincia: 'Sevilla',
    ccaa: 'Andalucía',
    distribuidora: 'Nedgia',
    grupoDistribuidora: 'Naturgy',
    emailContacto: 'fj.lopez@email.com',
    telefonoContacto: '+34 600 104 104',
    proceso: 'M1 - Alta de suministro',
    status: 'Revisar gestor',
    happyrobotRunId: generateFakeUUID(),
    events: [
      { type: 'email_sent', title: 'Email inicial', description: 'Alta de gas natural', metadata: {}, timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      { type: 'call', title: 'Primer intento', description: 'No contesta', metadata: { callStatus: 'Not reached' }, timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { type: 'call', title: 'Segundo intento', description: 'Teléfono apagado', metadata: { callStatus: 'Not reached' }, timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { type: 'needs_review', title: 'Múltiples intentos fallidos', description: 'Cliente no localizable', metadata: {}, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    ],
  },
  {
    codigoSC: 'SC-2024-105',
    dniCif: '56789012E',
    nombreApellidos: 'Elena Sánchez Moreno',
    cups: 'ES0021000000000105ES',
    contratoNC: 'NC-105-2024',
    lineaNegocio: 'Electricidad',
    direccionCompleta: 'Plaza Mayor 5, Bajo',
    codigoPostal: '50001',
    municipio: 'Zaragoza',
    provincia: 'Zaragoza',
    ccaa: 'Aragón',
    distribuidora: 'UFD',
    grupoDistribuidora: 'Naturgy',
    emailContacto: 'elena.sanchez@email.com',
    telefonoContacto: '+34 600 105 105',
    proceso: 'M2 - Cambio de titular',
    status: 'Revisar gestor',
    happyrobotRunId: generateFakeUUID(),
    events: [
      { type: 'email_sent', title: 'Solicitud cambio titular', description: 'Herencia de inmueble', metadata: {}, timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
      { type: 'incoming_email', title: 'Documentos recibidos', description: 'Certificado de defunción y testamento', metadata: {}, timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      { type: 'missing_information', title: 'Falta aceptación herencia', description: 'Se requiere escritura de aceptación', metadata: {}, timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      { type: 'needs_review', title: 'Caso complejo', description: 'Múltiples herederos, requiere validación legal', metadata: {}, timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) },
    ],
  },
  {
    codigoSC: 'SC-2024-106',
    dniCif: '67890123F',
    nombreApellidos: 'Roberto García Navarro',
    cups: 'ES0021000000000106RG',
    contratoNC: 'NC-106-2024',
    lineaNegocio: 'Gas',
    direccionCompleta: 'Calle Larios 22, 5A',
    codigoPostal: '29015',
    municipio: 'Málaga',
    provincia: 'Málaga',
    ccaa: 'Andalucía',
    distribuidora: 'Nedgia',
    grupoDistribuidora: 'Naturgy',
    emailContacto: 'roberto.garcia@email.com',
    telefonoContacto: '+34 600 106 106',
    proceso: 'M1 - Alta de suministro',
    status: 'Revisar gestor',
    happyrobotRunId: generateFakeUUID(),
    events: [
      { type: 'email_sent', title: 'Email inicial', description: 'Nueva instalación de gas', metadata: {}, timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { type: 'call', title: 'Contacto exitoso', description: 'Cliente confirma interés', metadata: { callStatus: 'Reached' }, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { type: 'incoming_email', title: 'Email con dudas', description: 'Preguntas sobre instalación', metadata: {}, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { type: 'needs_review', title: 'Consultas técnicas', description: 'Requiere asesoramiento especializado', metadata: {}, timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) },
    ],
  },
  {
    codigoSC: 'SC-2024-107',
    dniCif: '78901234G',
    nombreApellidos: 'Patricia Díaz Romero',
    cups: 'ES0021000000000107PD',
    contratoNC: 'NC-107-2024',
    lineaNegocio: 'Electricidad',
    direccionCompleta: 'Avenida Diagonal 450, 8B',
    codigoPostal: '08006',
    municipio: 'Barcelona',
    provincia: 'Barcelona',
    ccaa: 'Cataluña',
    distribuidora: 'UFD',
    grupoDistribuidora: 'Naturgy',
    emailContacto: 'patricia.diaz@email.com',
    telefonoContacto: '+34 600 107 107',
    proceso: 'M3 - Modificación de potencia',
    potenciaActual: '5.75',
    potenciaSolicitada: '10.35',
    status: 'Revisar gestor',
    happyrobotRunId: generateFakeUUID(),
    events: [
      { type: 'email_sent', title: 'Solicitud aumento', description: 'Necesita más potencia para negocio', metadata: {}, timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { type: 'call', title: 'Llamada informativa', description: 'Explicación de proceso y costes', metadata: { callStatus: 'Reached' }, timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { type: 'wait_time', title: 'Esperando confirmación', description: 'Cliente revisando presupuesto', metadata: { waitHours: 72 }, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { type: 'needs_review', title: 'Sin respuesta', description: 'Plazo de confirmación vencido', metadata: {}, timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000) },
    ],
  },
  {
    codigoSC: 'SC-2024-108',
    dniCif: '89012345H',
    nombreApellidos: 'Antonio Jiménez Blanco',
    cups: 'ES0021000000000108AJ',
    contratoNC: 'NC-108-2024',
    lineaNegocio: 'Gas',
    direccionCompleta: 'Calle Colón 30, 2C',
    codigoPostal: '46004',
    municipio: 'Valencia',
    provincia: 'Valencia',
    ccaa: 'Comunidad Valenciana',
    distribuidora: 'Nedgia',
    grupoDistribuidora: 'Naturgy',
    emailContacto: 'antonio.jimenez@email.com',
    telefonoContacto: '+34 600 108 108',
    proceso: 'M2 - Cambio de titular',
    status: 'Revisar gestor',
    happyrobotRunId: generateFakeUUID(),
    events: [
      { type: 'email_sent', title: 'Email inicial', description: 'Cambio por compraventa', metadata: {}, timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
      { type: 'incoming_email', title: 'Escritura recibida', description: 'Documentación de compraventa', metadata: {}, timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { type: 'call', title: 'Verificación datos', description: 'Discrepancia en dirección', metadata: { callStatus: 'Reached' }, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { type: 'needs_review', title: 'Datos inconsistentes', description: 'Dirección no coincide con catastro', metadata: {}, timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) },
    ],
  },
  {
    codigoSC: 'SC-2024-109',
    dniCif: '90123456I',
    nombreApellidos: 'Marta Hernández Vega',
    cups: 'ES0021000000000109MH',
    contratoNC: 'NC-109-2024',
    lineaNegocio: 'Electricidad',
    direccionCompleta: 'Paseo de la Castellana 200, 10A',
    codigoPostal: '28046',
    municipio: 'Madrid',
    provincia: 'Madrid',
    ccaa: 'Madrid',
    distribuidora: 'UFD',
    grupoDistribuidora: 'Naturgy',
    emailContacto: 'marta.hernandez@email.com',
    telefonoContacto: '+34 600 109 109',
    proceso: 'M1 - Alta de suministro',
    potenciaActual: '0',
    potenciaSolicitada: '6.9',
    status: 'Revisar gestor',
    happyrobotRunId: generateFakeUUID(),
    events: [
      { type: 'email_sent', title: 'Solicitud alta', description: 'Nuevo suministro en local comercial', metadata: {}, timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      { type: 'call', title: 'Contacto inicial', description: 'Cliente confirma datos', metadata: { callStatus: 'Reached' }, timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { type: 'incoming_email', title: 'Licencia de actividad', description: 'Documento adjunto', metadata: {}, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { type: 'missing_information', title: 'Falta CIF empresa', description: 'Se requiere CIF para facturación', metadata: {}, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { type: 'needs_review', title: 'Pendiente documentación', description: 'Cliente no ha enviado CIF', metadata: {}, timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) },
    ],
  },
  {
    codigoSC: 'SC-2024-110',
    dniCif: '01234567J',
    nombreApellidos: 'David Muñoz Castro',
    cups: 'ES0021000000000110DM',
    contratoNC: 'NC-110-2024',
    lineaNegocio: 'Gas',
    direccionCompleta: 'Calle Princesa 40, 6D',
    codigoPostal: '28008',
    municipio: 'Madrid',
    provincia: 'Madrid',
    ccaa: 'Madrid',
    distribuidora: 'Nedgia',
    grupoDistribuidora: 'Naturgy',
    emailContacto: 'david.munoz@email.com',
    telefonoContacto: '+34 600 110 110',
    proceso: 'M1 - Alta de suministro',
    status: 'Revisar gestor',
    happyrobotRunId: generateFakeUUID(),
    events: [
      { type: 'email_sent', title: 'Email inicial', description: 'Alta de gas en vivienda nueva', metadata: {}, timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
      { type: 'call', title: 'Primer contacto', description: 'Cliente viajando, pide llamar después', metadata: { callStatus: 'Reached' }, timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      { type: 'call', title: 'Segundo contacto', description: 'Sigue de viaje', metadata: { callStatus: 'Reached' }, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { type: 'needs_review', title: 'Cliente no disponible', description: 'Pendiente de que regrese de viaje', metadata: {}, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    ],
  },

  // === OTROS CASOS (IN PROGRESS, CANCELAR, RELANZAR) ===
  {
    codigoSC: 'SC-2024-001',
    dniCif: '12345678A',
    nombreApellidos: 'Juan García López',
    cups: 'ES0021000000000001JN',
    contratoNC: 'NC-001-2024',
    lineaNegocio: 'Electricidad',
    direccionCompleta: 'Calle Mayor 123, 1A',
    codigoPostal: '28013',
    municipio: 'Madrid',
    provincia: 'Madrid',
    ccaa: 'Madrid',
    distribuidora: 'UFD',
    grupoDistribuidora: 'Naturgy',
    emailContacto: 'juan.garcia@email.com',
    telefonoContacto: '+34 600 111 222',
    proceso: 'M1 - Alta de suministro',
    potenciaActual: '3.45',
    potenciaSolicitada: '5.75',
    status: 'In progress',
    happyrobotRunId: generateFakeUUID(),
    events: [
      { type: 'email_sent', title: 'Email inicial enviado', description: 'Solicitud de documentación para alta de suministro', metadata: {}, timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { type: 'call', title: 'Primera llamada', description: 'Intento de contacto - buzón de voz', metadata: { callStatus: 'Not reached' }, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
      { type: 'wait_time', title: 'Esperando respuesta', description: 'Plazo de 24h para respuesta del cliente', metadata: { waitHours: 24 }, timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    ],
  },
  {
    codigoSC: 'SC-2024-002',
    dniCif: '87654321B',
    nombreApellidos: 'María Rodríguez Sánchez',
    cups: 'ES0021000000000002MR',
    contratoNC: 'NC-002-2024',
    lineaNegocio: 'Gas',
    direccionCompleta: 'Avenida Libertad 45, 3B',
    codigoPostal: '08015',
    municipio: 'Barcelona',
    provincia: 'Barcelona',
    ccaa: 'Cataluña',
    distribuidora: 'Nedgia',
    grupoDistribuidora: 'Naturgy',
    emailContacto: 'maria.rodriguez@email.com',
    telefonoContacto: '+34 600 333 444',
    proceso: 'M2 - Cambio de titular',
    status: 'In progress',
    happyrobotRunId: generateFakeUUID(),
    events: [
      { type: 'email_sent', title: 'Email inicial enviado', description: 'Solicitud de documentación para cambio de titular', metadata: {}, timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { type: 'call', title: 'Primera llamada', description: 'Cliente contactado exitosamente', metadata: { callStatus: 'Reached' }, timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      { type: 'incoming_email', title: 'Documentación recibida', description: 'Cliente envió documentos solicitados', metadata: {}, timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    ],
  },
  {
    codigoSC: 'SC-2024-003',
    dniCif: '11223344C',
    nombreApellidos: 'Carlos Martínez Fernández',
    cups: 'ES0021000000000003CM',
    contratoNC: 'NC-003-2024',
    lineaNegocio: 'Electricidad',
    direccionCompleta: 'Plaza España 8, 2C',
    codigoPostal: '46001',
    municipio: 'Valencia',
    provincia: 'Valencia',
    ccaa: 'Comunidad Valenciana',
    distribuidora: 'UFD',
    grupoDistribuidora: 'Naturgy',
    emailContacto: 'carlos.martinez@email.com',
    telefonoContacto: '+34 600 555 666',
    proceso: 'M1 - Alta de suministro',
    potenciaActual: '4.6',
    potenciaSolicitada: '6.9',
    status: 'Relanzar SC',
    happyrobotRunId: generateFakeUUID(),
    events: [
      { type: 'email_sent', title: 'Email inicial enviado', description: 'Solicitud de documentación', metadata: {}, timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      { type: 'call', title: 'Llamada al cliente', description: 'Cliente contactado exitosamente', metadata: { callStatus: 'Reached' }, timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) },
      { type: 'incoming_email', title: 'Documentación recibida', description: 'Cliente envió documentación completa', metadata: {}, timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { type: 'result', title: 'Relanzada en SF', description: 'Caso relanzado en Salesforce', metadata: {}, timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
    ],
  },
  {
    codigoSC: 'SC-2024-004',
    dniCif: '55667788D',
    nombreApellidos: 'Ana López Pérez',
    cups: 'ES0021000000000004AL',
    contratoNC: 'NC-004-2024',
    lineaNegocio: 'Gas',
    direccionCompleta: 'Calle Sol 12, 4D',
    codigoPostal: '41001',
    municipio: 'Sevilla',
    provincia: 'Sevilla',
    ccaa: 'Andalucía',
    distribuidora: 'Nedgia',
    grupoDistribuidora: 'Naturgy',
    emailContacto: 'ana.lopez@email.com',
    telefonoContacto: '+34 600 777 888',
    proceso: 'M3 - Modificación de potencia',
    potenciaActual: '3.0',
    potenciaSolicitada: '5.5',
    status: 'Cancelar SC',
    happyrobotRunId: generateFakeUUID(),
    events: [
      { type: 'email_sent', title: 'Email inicial enviado', description: 'Solicitud para modificación', metadata: {}, timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
      { type: 'call', title: 'Múltiples intentos', description: 'Cliente no localizable', metadata: { callStatus: 'Not reached' }, timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      { type: 'result', title: 'Cancelada en SF', description: 'Cliente no localizable tras múltiples intentos', metadata: { note: 'Teléfono y email no válidos' }, timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    ],
  },
  {
    codigoSC: 'SC-2024-005',
    dniCif: '99887766E',
    nombreApellidos: 'Pedro Gómez Ruiz',
    cups: 'ES0021000000000005PG',
    contratoNC: 'NC-005-2024',
    lineaNegocio: 'Electricidad',
    direccionCompleta: 'Paseo Marítimo 78, 1A',
    codigoPostal: '29016',
    municipio: 'Málaga',
    provincia: 'Málaga',
    ccaa: 'Andalucía',
    distribuidora: 'UFD',
    grupoDistribuidora: 'Naturgy',
    emailContacto: 'pedro.gomez@email.com',
    telefonoContacto: '+34 600 999 000',
    proceso: 'M1 - Alta de suministro',
    potenciaActual: '2.3',
    potenciaSolicitada: '4.6',
    status: 'In progress',
    happyrobotRunId: generateFakeUUID(),
    events: [
      { type: 'email_sent', title: 'Email inicial enviado', description: 'Solicitud de alta', metadata: {}, timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000) },
      { type: 'call', title: 'Contacto telefónico', description: 'Cliente confirma recepción', metadata: { callStatus: 'Reached' }, timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000) },
      { type: 'wait_time', title: 'Esperando documentos', description: 'Plazo de 48h', metadata: { waitHours: 48 }, timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000) },
    ],
  },
];

export async function seedDatabase() {
  console.log('Starting database seeding...');

  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await query('DELETE FROM case_events');
    await query('DELETE FROM rejection_cases');

    // Insert mock cases
    for (const mockCase of mockCases) {
      console.log(`Inserting case: ${mockCase.codigoSC}`);
      
      // Insert case with happyrobot_run_id
      await query(
        `
        INSERT INTO rejection_cases (
          codigo_sc, dni_cif, nombre_apellidos, cups, contrato_nc, linea_negocio,
          direccion_completa, codigo_postal, municipio, provincia, ccaa,
          distribuidora, grupo_distribuidora, email_contacto, telefono_contacto,
          proceso, potencia_actual, potencia_solicitada, status, fecha_primer_contacto,
          happyrobot_run_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        `,
        [
          mockCase.codigoSC,
          mockCase.dniCif,
          mockCase.nombreApellidos,
          mockCase.cups,
          mockCase.contratoNC,
          mockCase.lineaNegocio,
          mockCase.direccionCompleta,
          mockCase.codigoPostal,
          mockCase.municipio,
          mockCase.provincia,
          mockCase.ccaa,
          mockCase.distribuidora,
          mockCase.grupoDistribuidora,
          mockCase.emailContacto,
          mockCase.telefonoContacto,
          mockCase.proceso,
          mockCase.potenciaActual || null,
          mockCase.potenciaSolicitada || null,
          mockCase.status,
          mockCase.events[0].timestamp,
          mockCase.happyrobotRunId || null,
        ]
      );

      // Insert events for this case
      for (const event of mockCase.events) {
        await query(
          `
          INSERT INTO case_events (case_id, type, title, description, metadata, timestamp)
          VALUES ($1, $2, $3, $4, $5, $6)
          `,
          [
            mockCase.codigoSC,
            event.type,
            event.title,
            event.description,
            JSON.stringify(event.metadata),
            event.timestamp,
          ]
        );
      }
    }

    console.log('✅ Database seeded successfully!');
    console.log(`Created ${mockCases.length} cases with their events.`);
    console.log(`  - 10 in "Revisar gestor"`);
    console.log(`  - 3 in "In progress"`);
    console.log(`  - 1 in "Relanzar SC"`);
    console.log(`  - 1 in "Cancelar SC"`);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
