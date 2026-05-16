import { Model } from 'mongoose';
import { Contact } from '@modules/contact/infra/mongo/models/Contact';
import { IContactDTO, IContactDocument } from '@modules/contact/dto/IContactDTO';
import IContactRepository from '@modules/contact/repositories/IContactRepository';
import { BaseMongoRepository } from '@shared/infra/database/mongo/BaseMongoRepository';

export default class ContactRepository
  extends BaseMongoRepository<IContactDTO, IContactDocument>
  implements IContactRepository
{
  protected readonly model: Model<IContactDocument> = Contact;
  protected readonly modelPopulated = [];
}
