import { container } from 'tsyringe';
import ISkillRepository from '@modules/skill/repositories/ISkillRepository';
import SkillRepository from '@modules/skill/infra/mongo/repositories/SkillRepository';

container.registerSingleton<ISkillRepository>(
  'SkillRepository',
  SkillRepository,
);
