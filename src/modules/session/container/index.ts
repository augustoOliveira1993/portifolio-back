import { container } from 'tsyringe';
import ISessionRepository from '../repositories/ISessionRepository';
import SessionMongoRepository from '../repositories/implementations/SessionMongoRepository';

container.registerSingleton<ISessionRepository>(
  'SessionRepository',
  SessionMongoRepository,
);
