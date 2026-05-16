import { injectable, inject } from 'tsyringe';
import IExperienceRepository from '@modules/experience/repositories/IExperienceRepository';
import { IExperienceDTO, IExperienceDocument } from '@modules/experience/dto/IExperienceDTO';
import { IServiceResponse } from '@shared/types/global';

@injectable()
export default class CreateService {
  constructor(
    @inject('ExperienceRepository')
    private repository: IExperienceRepository,
  ) {}

  public async execute(
    data: IExperienceDTO,
    userEmail: string | undefined,
  ): Promise<IServiceResponse<IExperienceDocument>> {
    const created = await this.repository.create({
      ...data,
      created_by: userEmail,
    });

    return {
      success: true,
      message: 'Experiência criada com sucesso!',
      data: created,
    };
  }
}
