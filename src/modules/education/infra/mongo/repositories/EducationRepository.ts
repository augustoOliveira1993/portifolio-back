import { Model } from 'mongoose';
import { Education } from '@modules/education/infra/mongo/models/Education';
import { IEducationDTO, IEducationDocument } from '@modules/education/dto/IEducationDTO';
import IEducationRepository from '@modules/education/repositories/IEducationRepository';
import { BaseMongoRepository } from '@shared/infra/database/mongo/BaseMongoRepository';

export default class EducationRepository
  extends BaseMongoRepository<IEducationDTO, IEducationDocument>
  implements IEducationRepository
{
  protected readonly model: Model<IEducationDocument> = Education;
  protected readonly modelPopulated = [];
}
