import { Model } from 'mongoose';
import { Experience } from '@modules/experience/infra/mongo/models/Experience';
import { IExperienceDTO, IExperienceDocument } from '@modules/experience/dto/IExperienceDTO';
import IExperienceRepository from '@modules/experience/repositories/IExperienceRepository';
import { BaseMongoRepository } from '@shared/infra/database/mongo/BaseMongoRepository';

export default class ExperienceRepository
  extends BaseMongoRepository<IExperienceDTO, IExperienceDocument>
  implements IExperienceRepository
{
  protected readonly model: Model<IExperienceDocument> = Experience;
  protected readonly modelPopulated = [];
}
