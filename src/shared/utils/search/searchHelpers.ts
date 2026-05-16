export interface SearchOptions {
  /** Campos pesquisados quando o valor for numérico (ex: ['codigo']). */
  numberFields?: string[];
  /** Campos pesquisados com regex quando o valor for texto (ex: ['nome', 'descricao']). */
  textFields: string[];
}

/**
 * Aplica o parâmetro `search` ao queryParams de forma padronizada
 * - Se `numberFields` for fornecido e o valor for numérico, filtra nesses campos
 * - Caso contrário aplica regex nos `textFields` via $or
 * @param query - Parâmetros da requisição
 * @param queryParams - QueryParams existente
 * @param options - Opções de busca (campos numéricos e textuais)
 * @returns QueryParams com busca aplicada
 */
export function applySearchParam(
  query: Record<string, any>,
  queryParams: Record<string, any>,
  options: SearchOptions,
): Record<string, any> {
  if (!query?.search) return queryParams;

  const searchValue = query.search as string;
  const result = { ...queryParams };

  if (options.numberFields?.length) {
    const isNumber = !isNaN(Number(searchValue)) && searchValue !== '';
    if (isNumber) {
      const numVal = Number(searchValue);
      if (options.numberFields.length === 1) {
        result[options.numberFields[0]] = numVal;
      } else {
        result.$or = options.numberFields.map(f => ({ [f]: numVal }));
      }
      return result;
    }
  }

  const regex = new RegExp(searchValue, 'i');
  result.$or = options.textFields.map(f => ({ [f]: { $regex: regex } }));
  return result;
}
