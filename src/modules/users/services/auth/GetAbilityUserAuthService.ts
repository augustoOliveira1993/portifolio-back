import { injectable, inject } from 'tsyringe';
import IUsersRepository from '../../repositories/IUsersRepository';
import { IPermissaoDTO } from '@modules/users/dto/IPermissaoDTO';
import { NotFoundError } from '@shared/errors/AppError';
import { ENameRoleDefault } from '@modules/users/dto/IRoleDTO';

@injectable()
export default class GetAbilityUserAuthService {
  constructor(
    @inject('UsersRepository')
    private repositoryUser: IUsersRepository,
  ) {}

  private isUserAdmin(user: any) {
    return user.role?.name === ENameRoleDefault.Administrador;
  }

  public async execute(id: string) {
    const userExist = await this.repositoryUser.findById(id);
    if (!userExist) {
      throw new NotFoundError({ message: 'Usuário não encontrado!' });
    }

    let ability: string[] = [];

    if (userExist.permissaos) {
      for (const p of userExist?.permissaos as unknown as IPermissaoDTO[]) {
        ability.push(p.name as string);
      }
    }

    return {
      _id: userExist._id,
      isAdmin: this.isUserAdmin(userExist) ?? false,
      ability,
    };
  }
}
