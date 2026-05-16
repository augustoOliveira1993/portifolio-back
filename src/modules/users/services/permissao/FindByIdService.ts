import { injectable, inject } from 'tsyringe';
import IPermissaoRepository from '../../repositories/IPermissaoRepository';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
class CreateService {
  constructor(
    @inject('PermissaoRepository')
    private repository: IPermissaoRepository,
  ) {}

  public async execute(id: string) {
    const roleExist = await this.repository.findById(id);
    if (!roleExist) {
      throw new NotFoundError({ message: 'Permissao não encontrada' });
    }
    return roleExist;
  }
}

export default CreateService;
