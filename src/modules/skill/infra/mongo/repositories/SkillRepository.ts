import { Model } from 'mongoose';
import { Skill } from '@modules/skill/infra/mongo/models/Skill';
import { ISkillDTO, ISkillDocument } from '@modules/skill/dto/ISkillDTO';
import ISkillRepository from '@modules/skill/repositories/ISkillRepository';
import { BaseMongoRepository } from '@shared/infra/database/mongo/BaseMongoRepository';

export default class SkillRepository
  extends BaseMongoRepository<ISkillDTO, ISkillDocument>
  implements ISkillRepository
{
  protected readonly model: Model<ISkillDocument> = Skill;
  protected readonly modelPopulated = [];
}
