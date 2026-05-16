import { injectable, inject } from 'tsyringe';
import IExperienceRepository from '@modules/experience/repositories/IExperienceRepository';
import { IServiceResponse } from '@shared/types/global';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
export default class DeleteService {
  constructor(
    @inject('ExperienceRepository')
    private repository: IExperienceRepository,
  ) {}

  public async execute(id: string): Promise<IServiceResponse<{ id: string }>> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundError({ message: 'Experiência não encontrada' });
    }

    return {
      success: true,
      message: 'Experiência deletada com sucesso!',
      data: { id: deleted.id },
    };
  }
}
