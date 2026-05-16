import { injectable, inject } from 'tsyringe';
import IProjectRepository from '@modules/project/repositories/IProjectRepository';
import { IProjectDocument } from '@modules/project/dto/IProjectDTO';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
export default class FindByIdService {
  constructor(
    @inject('ProjectRepository')
    private repository: IProjectRepository,
  ) {}

  public async execute(id: string): Promise<IProjectDocument> {
    const exist = await this.repository.findById(id);
    if (!exist) {
      throw new NotFoundError({ message: 'Projeto não encontrado' });
    }
    return exist;
  }
}
