import { injectable, inject } from 'tsyringe';
import { IPermissaoDTO } from '../../dto/IPermissaoDTO';
import IPermissaoRepository from '../../repositories/IPermissaoRepository';
import { ConflictError } from '@shared/errors/AppError';

@injectable()
class CreateService {
  constructor(
    @inject('PermissaoRepository')
    private repository: IPermissaoRepository,
  ) {}

  public async execute(data: IPermissaoDTO) {
    const roleNameExist = await this.repository.findByName(data.name as string);
    if (roleNameExist) {
      throw new ConflictError({ message: 'O nome da permissão já existe' });
    }
    const created = await this.repository.create(data);
    return {
      success: true,
      message: 'Permissao criada com sucesso!',
      data: created,
    };
  }
}

export default CreateService;
