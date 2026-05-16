import { isValidObjectId } from 'mongoose';

/**
 * Valida se uma string é um ObjectId válido do MongoDB
 * @param id - String a ser validada
 * @returns boolean indicando se é um ObjectId válido
 */
export function isValidMongoId(id: string): boolean {
  return isValidObjectId(id);
}

// Mantém compatibilidade com código legado
export const isValidObjectIdMongose = isValidMongoId;
