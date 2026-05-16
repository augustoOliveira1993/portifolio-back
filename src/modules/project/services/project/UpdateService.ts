import { injectable, inject } from 'tsyringe';
import IProjectRepository from '@modules/project/repositories/IProjectRepository';
import { IProjectDTO, IProjectDocument } from '@modules/project/dto/IProjectDTO';
import { IServiceResponse } from '@shared/types/global';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
export default class UpdateService {
  constructor(
    @inject('ProjectRepository')
    private repository: IProjectRepository,
  ) {}

  public async execute(
    id: string,
    data: Partial<IProjectDTO>,
    userEmail: string | undefined,
  ): Promise<IServiceResponse<IProjectDocument>> {
    const exist = await this.repository.findById(id);
    if (!exist) {
      throw new NotFoundError({ message: 'Projeto não encontrado' });
    }

    const updated = await this.repository.update(id, {
      ...data,
      updated_by: userEmail,
    });

    return {
      success: true,
      message: 'Projeto atualizado com sucesso!',
      data: updated!,
    };
  }
}
