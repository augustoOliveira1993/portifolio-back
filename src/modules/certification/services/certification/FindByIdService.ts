import { injectable, inject } from 'tsyringe';
import ICertificationRepository from '@modules/certification/repositories/ICertificationRepository';
import { ICertificationDocument } from '@modules/certification/dto/ICertificationDTO';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
export default class FindByIdService {
  constructor(
    @inject('CertificationRepository')
    private repository: ICertificationRepository,
  ) {}

  public async execute(id: string): Promise<ICertificationDocument> {
    const exist = await this.repository.findById(id);
    if (!exist) {
      throw new NotFoundError({ message: 'Certificação não encontrada' });
    }
    return exist;
  }
}
