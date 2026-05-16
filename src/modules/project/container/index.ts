import { container } from 'tsyringe';
import IProjectRepository from '@modules/project/repositories/IProjectRepository';
import ProjectRepository from '@modules/project/infra/mongo/repositories/ProjectRepository';

container.registerSingleton<IProjectRepository>(
  'ProjectRepository',
  ProjectRepository,
);
