import { injectable, inject } from 'tsyringe';
import IProjectRepository from '@modules/project/repositories/IProjectRepository';
import { IServiceResponse } from '@shared/types/global';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
export default class DeleteService {
  constructor(
    @inject('ProjectRepository')
    private repository: IProjectRepository,
  ) {}

  public async execute(id: string): Promise<IServiceResponse<{ id: string }>> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundError({ message: 'Projeto não encontrado' });
    }

    return {
      success: true,
      message: 'Projeto deletado com sucesso!',
      data: { id: deleted.id },
    };
  }
}
