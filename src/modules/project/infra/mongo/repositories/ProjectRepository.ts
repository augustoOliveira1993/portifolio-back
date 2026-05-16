import { Model } from 'mongoose';
import { Project } from '@modules/project/infra/mongo/models/Project';
import { IProjectDTO, IProjectDocument } from '@modules/project/dto/IProjectDTO';
import IProjectRepository from '@modules/project/repositories/IProjectRepository';
import { BaseMongoRepository } from '@shared/infra/database/mongo/BaseMongoRepository';

export default class ProjectRepository
  extends BaseMongoRepository<IProjectDTO, IProjectDocument>
  implements IProjectRepository
{
  protected readonly model: Model<IProjectDocument> = Project;
  protected readonly modelPopulated = [];
}
