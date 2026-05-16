import { injectable, inject } from 'tsyringe';
import IEducationRepository from '@modules/education/repositories/IEducationRepository';
import { IEducationDTO, IEducationDocument } from '@modules/education/dto/IEducationDTO';
import { IServiceResponse } from '@shared/types/global';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
export default class UpdateService {
  constructor(
    @inject('EducationRepository')
    private repository: IEducationRepository,
  ) {}

  public async execute(
    id: string,
    data: Partial<IEducationDTO>,
    userEmail: string | undefined,
  ): Promise<IServiceResponse<IEducationDocument>> {
    const exist = await this.repository.findById(id);
    if (!exist) {
      throw new NotFoundError({ message: 'Formação não encontrada' });
    }

    const updated = await this.repository.update(id, {
      ...data,
      updated_by: userEmail,
    });

    return {
      success: true,
      message: 'Formação atualizada com sucesso!',
      data: updated!,
    };
  }
}
