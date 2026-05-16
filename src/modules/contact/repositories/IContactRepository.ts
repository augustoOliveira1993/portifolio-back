import { IContactDTO, IContactDocument } from '@modules/contact/dto/IContactDTO';
import IBaseRepository from '@shared/infra/database/mongo/IBaseRepository';

export default interface IContactRepository
  extends IBaseRepository<IContactDTO, IContactDocument> {
  // Adicione métodos customizados aqui
}
