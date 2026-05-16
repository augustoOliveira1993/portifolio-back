import { injectable, inject } from 'tsyringe';
import IContactRepository from '@modules/contact/repositories/IContactRepository';
import { IServiceResponse } from '@shared/types/global';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
export default class DeleteService {
  constructor(
    @inject('ContactRepository')
    private repository: IContactRepository,
  ) {}

  public async execute(id: string): Promise<IServiceResponse<{ id: string }>> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundError({ message: 'Mensagem não encontrada' });
    }

    return {
      success: true,
      message: 'Mensagem deletada com sucesso!',
      data: { id: deleted.id },
    };
  }
}
