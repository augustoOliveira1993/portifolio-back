// ====================================
// SHARED UTILITIES - CENTRALIZED EXPORTS
// ====================================
// Este arquivo centraliza todas as utilities compartilhadas
// organizadas por categoria para fácil importação

// Validation utilities
export { isValidMongoId, isValidObjectIdMongose } from './validation';

// Excel utilities
export {
  readExcelSheetToJson,
  jsonToExcel,
  convertExcelDate,
  sanitizeExcelValue,
  invalidDataProcessingExecel,
} from './excel';

// Pagination utilities
export {
  applyPaginationParams,
  buildPaginatedResult,
  IPaginationParams,
  IPaginatedResult,
} from './pagination';

// Formatters
export { parseExpirationTime, calculatePercentage } from './formatters';

// Search utilities
export { applySearchParam, SearchOptions } from './search';

// Comparison utilities
export { getDiffJson } from './comparison';

// Logger (mantido separado)
export { logger } from './logger';
