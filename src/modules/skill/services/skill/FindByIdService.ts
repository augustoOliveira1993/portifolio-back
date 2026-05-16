import { injectable, inject } from 'tsyringe';
import ISkillRepository from '@modules/skill/repositories/ISkillRepository';
import { ISkillDocument } from '@modules/skill/dto/ISkillDTO';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
export default class FindByIdService {
  constructor(
    @inject('SkillRepository')
    private repository: ISkillRepository,
  ) {}

  public async execute(id: string): Promise<ISkillDocument> {
    const exist = await this.repository.findById(id);
    if (!exist) {
      throw new NotFoundError({ message: 'Habilidade não encontrada' });
    }
    return exist;
  }
}
