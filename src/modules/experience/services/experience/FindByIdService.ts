import { injectable, inject } from 'tsyringe';
import IExperienceRepository from '@modules/experience/repositories/IExperienceRepository';
import { IExperienceDocument } from '@modules/experience/dto/IExperienceDTO';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
export default class FindByIdService {
  constructor(
    @inject('ExperienceRepository')
    private repository: IExperienceRepository,
  ) {}

  public async execute(id: string): Promise<IExperienceDocument> {
    const exist = await this.repository.findById(id);
    if (!exist) {
      throw new NotFoundError({ message: 'Experiência não encontrada' });
    }
    return exist;
  }
}
