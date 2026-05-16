import { container } from 'tsyringe';
import IContactRepository from '@modules/contact/repositories/IContactRepository';
import ContactRepository from '@modules/contact/infra/mongo/repositories/ContactRepository';

container.registerSingleton<IContactRepository>(
  'ContactRepository',
  ContactRepository,
);
