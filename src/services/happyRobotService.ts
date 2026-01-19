import dotenv from 'dotenv';

dotenv.config();

const HAPPYROBOT_WEBHOOK_URL = process.env.HAPPYROBOT_WEBHOOK_URL || 'https://workflows.platform.happyrobot.ai/hooks/8w6vk54dcqbg';

interface CaseData {
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
  fechaPrimerContacto?: string | Date;
}

/**
 * Transforms camelCase case data to Spanish Excel headers format for HappyRobot
 * Excludes: status, emailThreadId, fechaPrimerContacto
 */
function transformCaseDataForHappyRobot(caseData: CaseData): Record<string, any> {
  return {
    'DNI/CIF': caseData.dniCif,
    'Nombre y apellidos': caseData.nombreApellidos,
    'CUPS': caseData.cups,
    'Contrato NC': caseData.contratoNC,
    'Linea de negocio': caseData.lineaNegocio,
    'Código SC': caseData.codigoSC,
    'Dirección completa': caseData.direccionCompleta,
    'Codigo postal': caseData.codigoPostal,
    'Municipio': caseData.municipio,
    'Provincia': caseData.provincia,
    'CCAA': caseData.ccaa,
    'Distribuidora': caseData.distribuidora,
    'Grupo distribuidora': caseData.grupoDistribuidora,
    'Email contacto Naturgy': caseData.emailContacto,
    'Teléfono contacto Naturgy': caseData.telefonoContacto,
    'Proceso': caseData.proceso,
    'Potencia actual': caseData.potenciaActual || '',
    'Potencia solicitada': caseData.potenciaSolicitada || '',
  };
}

/**
 * Sends case data to HappyRobot webhook endpoint
 * @param caseData - The case data to send
 * @returns Promise with the response or throws an error
 */
export async function sendCaseToHappyRobot(caseData: CaseData): Promise<void> {
  const transformedData = transformCaseDataForHappyRobot(caseData);
  
  console.log('📤 Sending case to HappyRobot:', caseData.codigoSC);
  
  try {
    const response = await fetch(HAPPYROBOT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transformedData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HappyRobot webhook failed: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log('✅ HappyRobot webhook success:', {
      codigoSC: caseData.codigoSC,
      response: responseData,
    });
  } catch (error) {
    console.error('❌ HappyRobot webhook error:', {
      codigoSC: caseData.codigoSC,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    });
    throw error;
  }
}

export const happyRobotService = {
  sendCaseToHappyRobot,
};
