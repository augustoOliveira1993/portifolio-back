import { injectable, inject } from 'tsyringe';
import ISkillRepository from '@modules/skill/repositories/ISkillRepository';
import { IServiceResponse } from '@shared/types/global';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
export default class DeleteService {
  constructor(
    @inject('SkillRepository')
    private repository: ISkillRepository,
  ) {}

  public async execute(id: string): Promise<IServiceResponse<{ id: string }>> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundError({ message: 'Habilidade não encontrada' });
    }

    return {
      success: true,
      message: 'Habilidade deletada com sucesso!',
      data: { id: deleted.id },
    };
  }
}
