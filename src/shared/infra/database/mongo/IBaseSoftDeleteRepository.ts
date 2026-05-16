import IBaseMongoRepository from './IBaseMongoRepository';

export interface IBaseSoftDeleteRepository<TDTO, TDocument>
  extends IBaseMongoRepository<TDTO, TDocument> {
  softDelete(id: string, data?: Partial<TDTO>): Promise<TDocument | null>;
  restore(id: string, data?: Partial<TDTO>): Promise<TDocument | null>;
  findAllDeleted(query?: Partial<TDTO>): Promise<TDocument[]>;
  totalDeleted(query?: Partial<TDTO>): Promise<number>;
  findByIdDeleted(id: string): Promise<TDocument | null>;
}
