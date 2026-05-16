import { injectable, inject } from 'tsyringe';
import IEducationRepository from '@modules/education/repositories/IEducationRepository';
import { IServiceResponse } from '@shared/types/global';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
export default class DeleteService {
  constructor(
    @inject('EducationRepository')
    private repository: IEducationRepository,
  ) {}

  public async execute(id: string): Promise<IServiceResponse<{ id: string }>> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundError({ message: 'Formação não encontrada' });
    }

    return {
      success: true,
      message: 'Formação deletada com sucesso!',
      data: { id: deleted.id },
    };
  }
}
