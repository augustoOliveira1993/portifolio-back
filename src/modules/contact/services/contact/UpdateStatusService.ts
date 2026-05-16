import { injectable, inject } from 'tsyringe';
import IContactRepository from '@modules/contact/repositories/IContactRepository';
import { EContactStatus, IContactDocument } from '@modules/contact/dto/IContactDTO';
import { IServiceResponse } from '@shared/types/global';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
export default class UpdateStatusService {
  constructor(
    @inject('ContactRepository')
    private repository: IContactRepository,
  ) {}

  public async execute(
    id: string,
    status: EContactStatus,
    userEmail: string | undefined,
  ): Promise<IServiceResponse<IContactDocument>> {
    const exist = await this.repository.findById(id);
    if (!exist) {
      throw new NotFoundError({ message: 'Mensagem não encontrada' });
    }

    const updated = await this.repository.update(id, { status, updated_by: userEmail });

    return {
      success: true,
      message: 'Status atualizado com sucesso!',
      data: updated!,
    };
  }
}
