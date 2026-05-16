import { Model } from 'mongoose';
import { Log } from '@modules/log/infra/mongo/models/Log';
import { ILogDTO, ILogDocument } from '@modules/log/dto/ILogDTO';
import ILogRepository from '@modules/log/repositories/ILogRepository';
import { BaseMongoRepository } from '@shared/infra/database/mongo/BaseMongoRepository';

export default class LogRepository
  extends BaseMongoRepository<ILogDTO, ILogDocument>
  implements ILogRepository
{
  protected readonly model: Model<ILogDocument> = Log;
  protected readonly modelPopulated = [];
}
