// ====================================
// HELPERS - LEGACY COMPATIBILITY FILE
// ====================================
// Este arquivo mantém compatibilidade com código legado.
// Para novos projetos, importe diretamente dos módulos especializados:
// - @shared/utils/validation
// - @shared/utils/excel
// - @shared/utils/pagination
// - @shared/utils/formatters
// - @shared/utils/search
// - @shared/utils/comparison

// Re-export from specialized modules
export { isValidMongoId, isValidObjectIdMongose } from './validation';
export {
  readExcelSheetToJson,
  jsonToExcel,
  convertExcelDate,
  sanitizeExcelValue,
  invalidDataProcessingExecel,
} from './excel';
export {
  applyPaginationParams,
  buildPaginatedResult,
  IPaginationParams,
  IPaginatedResult,
} from './pagination';
export { parseExpirationTime, calculatePercentage } from './formatters';
export { applySearchParam, SearchOptions } from './search';
export { getDiffJson } from './comparison';

// ====================================
// DOMAIN-SPECIFIC FUNCTIONS
// ====================================
// As funções abaixo são específicas de domínio e devem ser movidas
// para seus respectivos módulos de negócio

/**
 * @deprecated Mover para módulo de domínio específico
 */
export function getIsObrar(posicaoId: string): boolean {
  if (!posicaoId) return false;
  return ['2.1.4', '2.2.1', '2.2.2'].includes(`${posicaoId}`?.substring(0, 5));
}

/**
 * @deprecated Mover para módulo de domínio específico
 */
export function getSituacaoColaborador(status: string) {
  let TYPE_STATUS: any = {
    ATIVO: 'ATIVO',
    INATIVO: 'INATIVO',
    PENDENTE: 'PENDENTE',
    REDUÇÃO: 'REDUCAO',
  };

  return (
    (TYPE_STATUS[status.toUpperCase()] as
      | 'ATIVO'
      | 'INATIVO'
      | 'PENDENTE'
      | 'REDUCAO') || 'ATIVO'
  );
}

/**
 * @deprecated Mover para módulo de domínio específico
 */
export function getSituacaoPosicao(status: string) {
  let TYPE_STATUS: any = {
    ATIVA: 'ATIVO',
    INATIVO: 'INATIVO',
    PENDENTE: 'PENDENTE',
    REDUÇÃO: 'REDUCAO',
  };

  if (status === 'ATIVA') {
    status = 'ATIVO';
  }
  return (
    (TYPE_STATUS[status.toUpperCase()] as
      | 'ATIVO'
      | 'INATIVO'
      | 'PENDENTE'
      | 'REDUCAO') || 'ATIVO'
  );
}

/**
 * @deprecated Mover para módulo de domínio específico
 * @param statusPosicao - Status da posição
 * @returns POSICAO | GRUPO
 * @description retorna o tipo da posição com base no status
 */
export function getTipoPosicao(statusPosicao: string) {
  return statusPosicao === 'ATIVA' || statusPosicao === 'PENDENTE'
    ? 'POSICAO'
    : 'GRUPO';
}

/**
 * @deprecated Utilizar bibliotecas específicas para agregação (lodash, ramda)
 */
export function getCountAgrupamentoByField(
  data: any[],
  field: string,
  isCount: boolean = false,
) {
  let agrupamento: any = {};
  data.forEach(e => {
    if (e[field]) {
      if (!agrupamento[e[field]]) {
        agrupamento[e[field]] = 1;
      } else {
        agrupamento[e[field]] += 1;
      }
    }
  });

  return isCount ? Object.keys(agrupamento).length : agrupamento;
}
