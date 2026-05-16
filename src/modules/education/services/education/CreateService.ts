import { injectable, inject } from 'tsyringe';
import IEducationRepository from '@modules/education/repositories/IEducationRepository';
import { IEducationDTO, IEducationDocument } from '@modules/education/dto/IEducationDTO';
import { IServiceResponse } from '@shared/types/global';

@injectable()
export default class CreateService {
  constructor(
    @inject('EducationRepository')
    private repository: IEducationRepository,
  ) {}

  public async execute(
    data: IEducationDTO,
    userEmail: string | undefined,
  ): Promise<IServiceResponse<IEducationDocument>> {
    const created = await this.repository.create({
      ...data,
      created_by: userEmail,
    });

    return {
      success: true,
      message: 'Formação criada com sucesso!',
      data: created,
    };
  }
}
