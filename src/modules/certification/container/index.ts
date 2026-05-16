import { container } from 'tsyringe';
import ICertificationRepository from '@modules/certification/repositories/ICertificationRepository';
import CertificationRepository from '@modules/certification/infra/mongo/repositories/CertificationRepository';

container.registerSingleton<ICertificationRepository>(
  'CertificationRepository',
  CertificationRepository,
);
