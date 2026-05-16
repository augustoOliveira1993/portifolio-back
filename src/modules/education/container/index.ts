import { container } from 'tsyringe';
import IEducationRepository from '@modules/education/repositories/IEducationRepository';
import EducationRepository from '@modules/education/infra/mongo/repositories/EducationRepository';

container.registerSingleton<IEducationRepository>(
  'EducationRepository',
  EducationRepository,
);
