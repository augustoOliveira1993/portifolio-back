import { injectable, inject } from 'tsyringe';
import ICertificationRepository from '@modules/certification/repositories/ICertificationRepository';
import { IServiceResponse } from '@shared/types/global';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
export default class DeleteService {
  constructor(
    @inject('CertificationRepository')
    private repository: ICertificationRepository,
  ) {}

  public async execute(id: string): Promise<IServiceResponse<{ id: string }>> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundError({ message: 'Certificação não encontrada' });
    }

    return {
      success: true,
      message: 'Certificação deletada com sucesso!',
      data: { id: deleted.id },
    };
  }
}
