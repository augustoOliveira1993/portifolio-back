import moment from 'moment-timezone';

/**
 * Converte data serial do Excel para formato DD/MM/YYYY
 * @param excelDate - Data serial do Excel (número) ou string
 * @returns String formatada DD/MM/YYYY ou mensagem de erro
 */
export function convertExcelDate(excelDate: any): string {
  const regex = /^[0-9]+$/;
  if (!regex.test(excelDate)) {
    return ['#N/D', undefined, 'undefined', '***'].indexOf(excelDate) === -1
      ? 'Data Invalida'
      : excelDate;
  }

  const serial = parseInt(excelDate, 10);
  const utc_days = serial - 25568;
  const date = new Date(utc_days * 86400 * 1000);

  const formattedDate = moment(date).format('DD/MM/YYYY');
  return formattedDate;
}

/**
 * Processa valores inválidos do Excel, retornando um valor padrão
 * @param value - Valor a ser processado
 * @param type - Tipo esperado ('string' ou 'number')
 * @returns Valor processado ou valor padrão
 */
export function sanitizeExcelValue(value: any, type: string = 'string'): any {
  if ([null, 'null', 'NULL', undefined, 'undefined'].indexOf(value) === -1) {
    return value;
  } else {
    if (type === 'number') {
      return 0;
    } else {
      return '';
    }
  }
}

// Mantém compatibilidade com código legado
export const invalidDataProcessingExecel = sanitizeExcelValue;
