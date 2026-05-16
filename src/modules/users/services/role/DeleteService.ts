import { injectable, inject } from 'tsyringe';
import IRoleRepository from '../../repositories/IRoleRepository';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
class DeleteRoleService {
  constructor(
    @inject('RoleRepository')
    private repository: IRoleRepository,
  ) {}

  public async execute(id: string) {
    const roleDeleted = await this.repository.delete(id);
    if (!roleDeleted) {
      throw new NotFoundError({ message: 'Role não encontrada' });
    }
    return {
      success: true,
      message: 'Role deletada com sucesso!',
      data: {
        id: roleDeleted.id,
        name: roleDeleted.name,
      },
    };
  }
}

export default DeleteRoleService;
