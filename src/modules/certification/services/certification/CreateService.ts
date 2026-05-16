import { injectable, inject } from 'tsyringe';
import ICertificationRepository from '@modules/certification/repositories/ICertificationRepository';
import { ICertificationDTO, ICertificationDocument } from '@modules/certification/dto/ICertificationDTO';
import { IServiceResponse } from '@shared/types/global';

@injectable()
export default class CreateService {
  constructor(
    @inject('CertificationRepository')
    private repository: ICertificationRepository,
  ) {}

  public async execute(
    data: ICertificationDTO,
    userEmail: string | undefined,
  ): Promise<IServiceResponse<ICertificationDocument>> {
    const created = await this.repository.create({
      ...data,
      created_by: userEmail,
    });

    return {
      success: true,
      message: 'Certificação criada com sucesso!',
      data: created,
    };
  }
}
