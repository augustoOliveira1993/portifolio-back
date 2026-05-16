import { injectable, inject } from 'tsyringe';
import { IUserDTO, IUserDocument } from '../../dto/IUserDTO';
import IUsersRepository from '../../repositories/IUsersRepository';
import { AppError, BadRequestError } from '@shared/errors/AppError';
import bcrypt from 'bcryptjs';

interface IRequest {
  _id: string;
  username: string;
  status: string;
  email: string;
  avatar_url: string;
  pagina_inicial: string;
  setor: string;
  role: string;
  permissions: string;
}

@injectable()
export default class UpdateService {
  constructor(
    @inject('UsersRepository')
    private repository: IUsersRepository,
  ) {}

  public async execute(id: string, data: IUserDTO) {
    const exist = await this.repository.findById(id);
    if (!exist) {
      throw new BadRequestError({
        message: 'Usuário não encontrado',
      });
    }

    const updatedUser = await this.repository.update(id, data);
    return {
      success: true,
      message: 'Usuário atualizado com sucesso!',
      data: updatedUser,
    };
  }
}
