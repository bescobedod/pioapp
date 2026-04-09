/**
 * Constantes para el módulo de Boletas
 */

const REPORTS_BASE_URL = process.env.EXPO_PUBLIC_REPORTS_URL;

// URLs del sistema
export const BOLETA_PDF_BASE_URL = `${REPORTS_BASE_URL}/nomina/reports/formats/boletaFirmada.php`;

export const BOLETA_BONO14_PDF_URL = `${REPORTS_BASE_URL}/nomina/reports/formats/boletaBonoConfirmada.php`

export const BOLETA_AGUINALDO_PDF_URL = `${REPORTS_BASE_URL}/nomina/reports/formats/boletaAguinaldoConfirmada.php`

export const BOLETA_VACACION_PDF_URL = `${REPORTS_BASE_URL}/nomina/reports/formatosRH/reporteVacaciones.php`

// Mensajes de la aplicación
export const BOLETA_MESSAGES = {
    // Mensajes de éxito
    SUCCESS: {
        BOLETA_FIRMADA_LOADED: 'Boleta firmada cargada correctamente',
        BOLETA_FIRMADA: 'Boleta firmada exitosamente',
        PDF_DESCARGADO: 'PDF descargado exitosamente',
        DATOS_CAPTURADOS: 'Datos de dispositivo capturados',
    },
    
    // Mensajes de error
    ERROR: {
        SELECCIONAR_PERIODO: 'Debe seleccionar un período',
        ERROR_FIRMAR: 'Error al firmar la boleta',
        ERROR_VERIFICAR: 'Error al verificar el estado de la boleta',
        ERROR_PROCESAR: 'Error al procesar la boleta',
        ERROR_PROCESO_FIRMA: 'Error en el proceso de firma',
        NO_BOLETA_ENCONTRADA: 'No se encontró boleta para el período seleccionado',
        FALTAN_DATOS_PDF: 'Faltan datos para descargar el PDF',
        ERROR_DESCARGAR_PDF: 'Error al descargar el PDF',
        ERROR_CAPTURAR_DATOS: 'Error capturando datos del dispositivo',
    },
    
    // Mensajes de advertencia
    WARNING: {
        CONSULTA_CANCELADA: 'Consulta cancelada - La boleta no está firmada',
        INICIANDO_FIRMA: 'Iniciando proceso de firma...',
        PROCESANDO_FIRMA: 'Procesando firma...',
        OBTENIENDO_UBICACION: 'Obteniendo datos de ubicación...',
        DESCARGANDO_PDF: 'Descargando PDF...',
    },
    
    // Mensajes de confirmación
    CONFIRM: {
        BOLETA_NO_FIRMADA_TITLE: 'Boleta no firmada',
        BOLETA_NO_FIRMADA_MESSAGE: '¿Desea firmar su boleta?',
    }
} as const;

// Configuración de timeouts
export const TIMEOUTS = {
    IP_REQUEST: 5000, // 5 segundos para obtener IP
} as const;