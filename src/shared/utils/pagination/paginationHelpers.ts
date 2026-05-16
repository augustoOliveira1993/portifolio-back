export interface IPaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  sortBy?: string;
  sortDesc?: boolean;
  skip?: number;
}

export interface IPaginatedResult<T> {
  data: T[];
  total: number;
  limit: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
}

/**
 * Aplica os parâmetros de paginação e ordenação ao queryParams
 * O cliente envia: page (1-based), limit, sortBy, sortDesc
 * O skip é calculado internamente: skip = (page - 1) * limit
 * @param query - Parâmetros da requisição
 * @param queryParams - QueryParams existente (opcional)
 * @returns QueryParams com paginação aplicada
 */
export function applyPaginationParams(
  query: Record<string, any>,
  queryParams: Record<string, any> = {},
): Record<string, any> {
  const result = { ...queryParams };
  const limit = Number(query?.limit) || 0;
  const page = Number(query?.page) || 1;
  if (limit) result.limit = limit;
  result.skip = limit > 0 ? (page - 1) * limit : 0;
  if (query?.sortBy) result.sortBy = query.sortBy;
  if (query?.sortDesc) result.sortDesc = query.sortDesc;
  return result;
}

/**
 * Monta o objeto de resposta paginado padronizado
 * @param data - Registros retornados pela query
 * @param total - Total de registros sem paginação (via count)
 * @param query - Query original da requisição (contém page e limit)
 * @returns Objeto com dados paginados e metadados
 */
export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  query: Record<string, any>,
): IPaginatedResult<T> {
  const limit = Number(query?.limit) || 0;
  const page = Number(query?.page) || 1;
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 1;
  const hasNext = page < totalPages;
  return { hasNext, total, limit, currentPage: page, totalPages, data };
}
