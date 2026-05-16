import { injectable, inject } from 'tsyringe';
import IContactRepository from '@modules/contact/repositories/IContactRepository';
import { EContactStatus, IContactDocument } from '@modules/contact/dto/IContactDTO';
import { IServiceResponse } from '@shared/types/global';

@injectable()
export default class CreateService {
  constructor(
    @inject('ContactRepository')
    private repository: IContactRepository,
  ) {}

  public async execute(
    data: { name: string; email: string; subject: string; message: string },
  ): Promise<IServiceResponse<IContactDocument>> {
    const created = await this.repository.create({
      ...data,
      status: EContactStatus.NOVO,
    });

    return {
      success: true,
      message: 'Mensagem enviada com sucesso!',
      data: created,
    };
  }
}
