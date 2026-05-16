import { injectable, inject } from 'tsyringe';
import IUsersRepository from '../../repositories/IUsersRepository';
import { NotFoundError } from '@shared/errors/AppError';
import { IPermissaoDTO } from '@modules/users/dto/IPermissaoDTO';

@injectable()
export default class GetMeService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
  ) {}

  public async execute(id: string) {
    const userExist = await this.usersRepository.findById(id);
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
      email: userExist.email,
      username: userExist.username,
      pagina_inicial: userExist.pagina_inicial,
      status: userExist.status,
      isAdmin: (await this.usersRepository.isAdmin(userExist?.email)) ?? false,
      ability,
    };
  }
}
