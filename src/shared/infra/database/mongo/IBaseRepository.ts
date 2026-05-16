import { UpdateWriteOpResult } from 'mongoose';
import { IQueryParams } from './BaseMongoRepository';

export default interface IBaseRepository<TDTO, TDocument> {
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
}
