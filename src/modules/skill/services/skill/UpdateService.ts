import { injectable, inject } from 'tsyringe';
import ISkillRepository from '@modules/skill/repositories/ISkillRepository';
import { ISkillDTO, ISkillDocument } from '@modules/skill/dto/ISkillDTO';
import { IServiceResponse } from '@shared/types/global';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
export default class UpdateService {
  constructor(
    @inject('SkillRepository')
    private repository: ISkillRepository,
  ) {}

  public async execute(
    id: string,
    data: Partial<ISkillDTO>,
    userEmail: string | undefined,
  ): Promise<IServiceResponse<ISkillDocument>> {
    const exist = await this.repository.findById(id);
    if (!exist) {
      throw new NotFoundError({ message: 'Habilidade não encontrada' });
    }

    const updated = await this.repository.update(id, {
      ...data,
      updated_by: userEmail,
    });

    return {
      success: true,
      message: 'Habilidade atualizada com sucesso!',
      data: updated!,
    };
  }
}
