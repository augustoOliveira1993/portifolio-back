import { ICertificationDTO, ICertificationDocument } from '@modules/certification/dto/ICertificationDTO';
import IBaseRepository from '@shared/infra/database/mongo/IBaseRepository';

export default interface ICertificationRepository
  extends IBaseRepository<ICertificationDTO, ICertificationDocument> {
  // Adicione métodos customizados aqui
}
