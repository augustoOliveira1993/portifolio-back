import { injectable, inject } from 'tsyringe';
import IExperienceRepository from '@modules/experience/repositories/IExperienceRepository';
import { IExperienceDTO, IExperienceDocument } from '@modules/experience/dto/IExperienceDTO';
import { IServiceResponse } from '@shared/types/global';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
export default class UpdateService {
  constructor(
    @inject('ExperienceRepository')
    private repository: IExperienceRepository,
  ) {}

  public async execute(
    id: string,
    data: Partial<IExperienceDTO>,
    userEmail: string | undefined,
  ): Promise<IServiceResponse<IExperienceDocument>> {
    const exist = await this.repository.findById(id);
    if (!exist) {
      throw new NotFoundError({ message: 'Experiência não encontrada' });
    }

    const updated = await this.repository.update(id, {
      ...data,
      updated_by: userEmail,
    });

    return {
      success: true,
      message: 'Experiência atualizada com sucesso!',
      data: updated!,
    };
  }
}
