import { injectable, inject } from 'tsyringe';
import ISkillRepository from '@modules/skill/repositories/ISkillRepository';
import { ISkillDTO, ISkillDocument } from '@modules/skill/dto/ISkillDTO';
import { IServiceResponse } from '@shared/types/global';

@injectable()
export default class CreateService {
  constructor(
    @inject('SkillRepository')
    private repository: ISkillRepository,
  ) {}

  public async execute(
    data: ISkillDTO,
    userEmail: string | undefined,
  ): Promise<IServiceResponse<ISkillDocument>> {
    const created = await this.repository.create({
      ...data,
      created_by: userEmail,
    });

    return {
      success: true,
      message: 'Habilidade criada com sucesso!',
      data: created,
    };
  }
}
