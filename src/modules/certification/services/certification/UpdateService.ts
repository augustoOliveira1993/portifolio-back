import { injectable, inject } from 'tsyringe';
import ICertificationRepository from '@modules/certification/repositories/ICertificationRepository';
import { ICertificationDTO, ICertificationDocument } from '@modules/certification/dto/ICertificationDTO';
import { IServiceResponse } from '@shared/types/global';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
export default class UpdateService {
  constructor(
    @inject('CertificationRepository')
    private repository: ICertificationRepository,
  ) {}

  public async execute(
    id: string,
    data: Partial<ICertificationDTO>,
    userEmail: string | undefined,
  ): Promise<IServiceResponse<ICertificationDocument>> {
    const exist = await this.repository.findById(id);
    if (!exist) {
      throw new NotFoundError({ message: 'Certificação não encontrada' });
    }

    const updated = await this.repository.update(id, {
      ...data,
      updated_by: userEmail,
    });

    return {
      success: true,
      message: 'Certificação atualizada com sucesso!',
      data: updated!,
    };
  }
}
