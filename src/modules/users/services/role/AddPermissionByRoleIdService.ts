import { injectable, inject } from 'tsyringe';
import IRoleRepository from '../../repositories/IRoleRepository';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
export default class AddPermissionsByRoleIdService {
  constructor(
    @inject('RoleRepository')
    private repository: IRoleRepository,
  ) {}

  public async execute(id: string, dataBody: { permissions: string[] }) {
    const { permissions } = dataBody;
    const roleUpdated = await this.repository.addPermissionByRoleId(
      id,
      permissions,
    );
    if (!roleUpdated) {
      throw new NotFoundError({ message: 'Role não encontrada' });
    }
    return {
      success: true,
      message: 'Permissões adicionadas com sucesso',
      data: roleUpdated,
    };
  }
}
