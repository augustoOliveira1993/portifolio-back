import { ISkillDTO, ISkillDocument } from '@modules/skill/dto/ISkillDTO';
import IBaseRepository from '@shared/infra/database/mongo/IBaseRepository';

export default interface ISkillRepository
  extends IBaseRepository<ISkillDTO, ISkillDocument> {
  // Adicione métodos customizados aqui
}
