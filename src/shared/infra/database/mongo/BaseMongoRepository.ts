import { Document, Model, UpdateWriteOpResult } from 'mongoose';
import { BulkWriteResult } from 'mongodb';
import { IModelPopulated } from '@globalTypes/global';

export type IQueryParams = Record<string, any>;

type FilterQuery<TDTO> = Partial<TDTO> | Record<string, any>;
type UpdateQuery<TDTO> = Partial<TDTO> | Record<string, any>;

export type IBulkInsertOne<TDTO> = {
  insertOne: { document: TDTO };
};

export type IBulkUpdateOne<TDTO> = {
  updateOne: {
    filter: FilterQuery<TDTO>;
    update: UpdateQuery<TDTO>;
    upsert?: boolean;
  };
};

export type IBulkUpdateMany<TDTO> = {
  updateMany: {
    filter: FilterQuery<TDTO>;
    update: UpdateQuery<TDTO>;
    upsert?: boolean;
  };
};

export type IBulkDeleteOne<TDTO> = {
  deleteOne: { filter: FilterQuery<TDTO> };
};

export type IBulkDeleteMany<TDTO> = {
  deleteMany: { filter: FilterQuery<TDTO> };
};

export type IBulkReplaceOne<TDTO> = {
  replaceOne: {
    filter: FilterQuery<TDTO>;
    replacement: TDTO;
    upsert?: boolean;
  };
};

export type IBulkOperation<TDTO> =
  | IBulkInsertOne<TDTO>
  | IBulkUpdateOne<TDTO>
  | IBulkUpdateMany<TDTO>
  | IBulkDeleteOne<TDTO>
  | IBulkDeleteMany<TDTO>
  | IBulkReplaceOne<TDTO>;

export abstract class BaseMongoRepository<TDTO, TDocument extends Document> {
  protected abstract readonly model: Model<TDocument>;
  protected readonly modelPopulated: IModelPopulated[] = [];

  protected applyQueryOptions(
    mongooseQuery: any,
    options: {
      limit?: number;
      skip?: number;
      sortBy?: string | object;
      sortDesc?: boolean;
    },
  ): void {
    const { limit, skip, sortBy = 'createdAt', sortDesc = true } = options;

    if (sortBy) {
      if (typeof sortBy === 'string') {
        mongooseQuery.sort({ [sortBy]: sortDesc ? -1 : 1 });
      } else {
        mongooseQuery.sort(sortBy);
      }
    }

    if (limit) mongooseQuery.limit(limit);
    if (skip) mongooseQuery.skip(skip);
  }

  async create(data: TDTO): Promise<TDocument> {
    const doc = new this.model(data as any);
    return await doc.save();
  }

  async findAll(query: IQueryParams = {}): Promise<TDocument[]> {
    const { limit, skip, sortBy, sortDesc, ...restQuery } = query;
    const mongooseQuery = this.model
      .find(restQuery as any)
      .populate(this.modelPopulated);
    this.applyQueryOptions(mongooseQuery, { limit, skip, sortBy, sortDesc });
    return (await mongooseQuery.exec()) as unknown as TDocument[];
  }

  async findOne(query: IQueryParams = {}): Promise<TDocument | null> {
    const { limit, skip, sortBy, sortDesc, ...restQuery } = query;
    const mongooseQuery = this.model
      .findOne(restQuery as any)
      .populate(this.modelPopulated);
    this.applyQueryOptions(mongooseQuery, { limit, skip, sortBy, sortDesc });
    return (await mongooseQuery.exec()) as unknown as TDocument | null;
  }

  async findById(id: string): Promise<TDocument | null> {
    return (await this.model
      .findOne({ _id: id } as any)
      .populate(this.modelPopulated)) as unknown as TDocument | null;
  }

  async update(id: string, data: Partial<TDTO>): Promise<TDocument | null> {
    return (await this.model
      .findByIdAndUpdate(id, data as any, { new: true })
      .populate(this.modelPopulated)) as unknown as TDocument | null;
  }

  async delete(id: string): Promise<TDocument | null> {
    return (await this.model.findByIdAndDelete(
      id,
    )) as unknown as TDocument | null;
  }

  async count(query: IQueryParams = {}): Promise<number> {
    const { limit, skip, sortBy, sortDesc, ...restQuery } = query;
    if (limit) return limit;
    return await this.model.countDocuments(restQuery as any);
  }

  async total(query: IQueryParams = {}): Promise<number> {
    const { limit, skip, sortBy, sortDesc, ...restQuery } = query;
    return await this.model.countDocuments(restQuery as any);
  }

  async updateMany(
    query: IQueryParams,
    data: Partial<TDTO> | any,
  ): Promise<UpdateWriteOpResult> {
    return await this.model.updateMany(query, data);
  }

  async insertMany(data: TDTO[]): Promise<TDocument[]> {
    return this.model.insertMany(data as any);
  }

  async deleteMany(query: IQueryParams): Promise<void> {
    await this.model.deleteMany(query);
  }

  async bulkWrite(
    operations: IBulkOperation<TDTO>[],
  ): Promise<BulkWriteResult> {
    return await this.model.bulkWrite(operations as any);
  }

  async bulkUpsert(filter: (keyof TDTO)[], data: TDTO[]): Promise<void> {
    const operations: IBulkUpdateOne<TDTO>[] = data.map(item => ({
      updateOne: {
        filter: filter.reduce(
          (acc, key) => {
            acc[key as string] = (item as any)[key];
            return acc;
          },
          {} as Record<string, any>,
        ),
        update: { $set: item },
        upsert: true,
      },
    }));

    await this.bulkWrite(operations);
  }
}
