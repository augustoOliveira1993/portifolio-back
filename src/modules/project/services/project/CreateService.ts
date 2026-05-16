import { injectable, inject } from 'tsyringe';
import IProjectRepository from '@modules/project/repositories/IProjectRepository';
import { IProjectDTO, IProjectDocument } from '@modules/project/dto/IProjectDTO';
import { IServiceResponse } from '@shared/types/global';

@injectable()
export default class CreateService {
  constructor(
    @inject('ProjectRepository')
    private repository: IProjectRepository,
  ) {}

  public async execute(
    data: IProjectDTO,
    userEmail: string | undefined,
  ): Promise<IServiceResponse<IProjectDocument>> {
    const created = await this.repository.create({
      ...data,
      created_by: userEmail,
    });

    return {
      success: true,
      message: 'Projeto criado com sucesso!',
      data: created,
    };
  }
}
