import { injectable, inject } from 'tsyringe';
import IPermissaoGrupoRepository from '../../repositories/IPermissaoGrupoRepository';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
class CreateService {
  constructor(
    @inject('PermissaoGrupoRepository')
    private repository: IPermissaoGrupoRepository,
  ) {}

  public async execute(id: string) {
    const roleExist = await this.repository.findById(id);
    if (!roleExist) {
      throw new NotFoundError({ message: 'PermissaoGrupo não encontrada' });
    }
    return roleExist;
  }
}

export default CreateService;
