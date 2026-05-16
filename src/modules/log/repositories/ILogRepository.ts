import { ILogDTO, ILogDocument } from '@modules/log/dto/ILogDTO';
import IBaseRepository from '@shared/infra/database/mongo/IBaseRepository';

export default interface ILogRepository extends IBaseRepository<
  ILogDTO,
  ILogDocument
> {}
