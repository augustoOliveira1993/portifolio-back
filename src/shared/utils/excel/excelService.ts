import { readFileSync } from 'fs';
import XLSX from 'xlsx';
import moment from 'moment-timezone';
import path from 'path';
import fs from 'fs';
import uploadConfig from '@configs/storage/upload.config';

/**
 * Lê uma planilha Excel e converte para JSON
 * @param filePath - Caminho do arquivo Excel
 * @param sheetIndex - Índice da aba (default: 0)
 * @returns Array de objetos representando as linhas da planilha
 */
export function readExcelSheetToJson(filePath: string, sheetIndex: number = 0) {
  const buffer = readFileSync(filePath);
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  const sheetName = workbook.SheetNames[sheetIndex];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json(sheet);
}

/**
 * Converte um JSON em uma planilha Excel e salva no diretório configurado
 * @param data - Array de objetos a ser convertido
 * @param headers - Array com os nomes das colunas
 * @param sheetName - Nome da aba da planilha (default: 'Sheet1')
 * @returns O caminho completo do arquivo Excel gerado
 */
export function jsonToExcel(
  data: any[],
  headers: string[],
  sheetName: string = 'Sheet1',
): string {
  // Cria um novo worksheet vazio
  const worksheet = XLSX.utils.json_to_sheet([]);

  // Define o cabeçalho com o array de headers
  XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1' });

  // Adiciona os dados abaixo do cabeçalho
  XLSX.utils.sheet_add_json(worksheet, data, {
    origin: 'A2',
    skipHeader: true,
  });

  // Cria um novo workbook e adiciona o worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Gera um nome de arquivo único com timestamp
  const timestamp = moment().format('YYYYMMDDHHmmss');
  const fileName = `${timestamp}_${sheetName}.xlsx`;

  // Define o caminho completo do arquivo na pasta temporária
  const filePath = path.join(uploadConfig.directory, 'relatorios', fileName);

  // Verifica se o diretório existe; caso contrário, cria-o
  if (!fs.existsSync(path.dirname(filePath))) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  // Salva o arquivo no diretório especificado
  XLSX.writeFile(workbook, filePath);

  return filePath; // Retorna o caminho do arquivo gerado
}
