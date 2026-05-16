import { IExperienceDTO, IExperienceDocument } from '@modules/experience/dto/IExperienceDTO';
import IBaseRepository from '@shared/infra/database/mongo/IBaseRepository';

export default interface IExperienceRepository
  extends IBaseRepository<IExperienceDTO, IExperienceDocument> {
  // Adicione métodos customizados aqui
}
