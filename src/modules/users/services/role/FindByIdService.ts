import { injectable, inject } from 'tsyringe';
import IRoleRepository from '../../repositories/IRoleRepository';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
class CreateService {
  constructor(
    @inject('RoleRepository')
    private repository: IRoleRepository,
  ) {}

  public async execute(id: string) {
    const roleExist = await this.repository.findById(id);
    if (!roleExist) {
      throw new NotFoundError({ message: 'Role não encontrada' });
    }
    return roleExist;
  }
}

export default CreateService;
