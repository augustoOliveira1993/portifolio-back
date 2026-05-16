import { IEducationDTO, IEducationDocument } from '@modules/education/dto/IEducationDTO';
import IBaseRepository from '@shared/infra/database/mongo/IBaseRepository';

export default interface IEducationRepository
  extends IBaseRepository<IEducationDTO, IEducationDocument> {
  // Adicione métodos customizados aqui
}
