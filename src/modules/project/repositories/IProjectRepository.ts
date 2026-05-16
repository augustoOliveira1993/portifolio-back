import { IProjectDTO, IProjectDocument } from '@modules/project/dto/IProjectDTO';
import IBaseRepository from '@shared/infra/database/mongo/IBaseRepository';

export default interface IProjectRepository
  extends IBaseRepository<IProjectDTO, IProjectDocument> {
  // Adicione métodos customizados aqui
}
