import { injectable, inject } from 'tsyringe';
import { IPermissaoDTO } from '../../dto/IPermissaoDTO';
import IPermissaoRepository from '../../repositories/IPermissaoRepository';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
export default class UpdateService {
  constructor(
    @inject('PermissaoRepository')
    private repository: IPermissaoRepository,
  ) {}

  public async execute(idPermissao: string, data: IPermissaoDTO) {
    const roleExist = await this.repository.findById(idPermissao);
    if (!roleExist) {
      throw new NotFoundError({ message: 'Permissao não encontrada' });
    }
    const updatePermissao = await this.repository.update(idPermissao, data);
    return {
      success: true,
      message: `Permissao atualizada com sucesso!`,
      data: updatePermissao,
    };
  }
}
