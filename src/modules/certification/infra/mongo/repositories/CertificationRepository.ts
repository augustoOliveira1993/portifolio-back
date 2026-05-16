import { Model } from 'mongoose';
import { Certification } from '@modules/certification/infra/mongo/models/Certification';
import { ICertificationDTO, ICertificationDocument } from '@modules/certification/dto/ICertificationDTO';
import ICertificationRepository from '@modules/certification/repositories/ICertificationRepository';
import { BaseMongoRepository } from '@shared/infra/database/mongo/BaseMongoRepository';

export default class CertificationRepository
  extends BaseMongoRepository<ICertificationDTO, ICertificationDocument>
  implements ICertificationRepository
{
  protected readonly model: Model<ICertificationDocument> = Certification;
  protected readonly modelPopulated = [];
}
