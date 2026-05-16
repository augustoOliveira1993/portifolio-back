import { container } from 'tsyringe';
import IExperienceRepository from '@modules/experience/repositories/IExperienceRepository';
import ExperienceRepository from '@modules/experience/infra/mongo/repositories/ExperienceRepository';

container.registerSingleton<IExperienceRepository>(
  'ExperienceRepository',
  ExperienceRepository,
);
