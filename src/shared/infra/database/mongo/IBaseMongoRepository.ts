import { UpdateWriteOpResult } from 'mongoose';
import { BulkWriteResult } from 'mongodb';
import { IBulkOperation, IQueryParams } from './BaseMongoRepository';

export default interface IBaseMongoRepository<TDTO, TDocument> {
  create(data: TDTO): Promise<TDocument>;
  findAll(query?: IQueryParams): Promise<TDocument[]>;
  findOne(query?: IQueryParams): Promise<TDocument | null>;
  findById(id: string): Promise<TDocument | null>;
  update(id: string, data: Partial<TDTO>): Promise<TDocument | null>;
  delete(id: string): Promise<TDocument | null>;
  count(query?: IQueryParams): Promise<number>;
  total(query?: IQueryParams): Promise<number>;
  updateMany(
    query: IQueryParams,
    data: Partial<TDTO> | any,
  ): Promise<UpdateWriteOpResult>;
  insertMany(data: TDTO[]): Promise<TDocument[]>;
  deleteMany(query: IQueryParams): Promise<void>;
  bulkWrite(operations: IBulkOperation<TDTO>[]): Promise<BulkWriteResult>;
  bulkUpsert(filter: (keyof TDTO)[], data: TDTO[]): Promise<void>;
}
