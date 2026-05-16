import { injectable, inject } from 'tsyringe';
import { IDataBodyAddPermissions } from '../../dto/IUserDTO';
import {  NotFoundError } from '@shared/errors/AppError';
import IUsersRepository from '@modules/users/repositories/IUsersRepository';

@injectable()
export default class AddPermissionsByUserIdService {
  constructor(
    @inject('UsersRepository')
    private repository: IUsersRepository,
  ) {}

  public async execute(id: string, dataBody: IDataBodyAddPermissions) {
    const { permissaos } = dataBody;
    const roleUpdated = await this.repository.addPermissionByUserId(
      id,
      permissaos,
    );
    if (!roleUpdated) {
      throw new NotFoundError({ message: 'Usuário não encontrada' });
    }
    return {
      success: true,
      message: 'Permissões adicionada com sucesso',
      data: roleUpdated,
    };
  }
}
