import { injectable, inject } from 'tsyringe';
import IEducationRepository from '@modules/education/repositories/IEducationRepository';
import { IEducationDocument } from '@modules/education/dto/IEducationDTO';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
export default class FindByIdService {
  constructor(
    @inject('EducationRepository')
    private repository: IEducationRepository,
  ) {}

  public async execute(id: string): Promise<IEducationDocument> {
    const exist = await this.repository.findById(id);
    if (!exist) {
      throw new NotFoundError({ message: 'Formação não encontrada' });
    }
    return exist;
  }
}
