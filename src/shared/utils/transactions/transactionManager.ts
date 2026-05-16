import mongoose, { ClientSession } from 'mongoose';

/**
 * Executa um callback dentro de uma transaction MongoDB.
 * Faz commit automaticamente em caso de sucesso e rollback em caso de erro.
 *
 * @example
 * await withTransaction(async (session) => {
 *   await OrderRepository.create({ ... }, session);
 *   await StockRepository.update(id, { qty: qty - 1 }, session);
 * });
 */
export async function withTransaction<T>(
  callback: (session: ClientSession) => Promise<T>,
): Promise<T> {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const result = await callback(session);
    await session.commitTransaction();
    return result;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
