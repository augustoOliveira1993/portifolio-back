import { injectable, inject } from 'tsyringe';
import IUsersRepository from '../../repositories/IUsersRepository';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
export default class FindByIdService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
  ) {}

  public async execute(id: string) {
    const userExist = await this.usersRepository.findById(id);
    if (!userExist) {
      throw new NotFoundError({ message: 'Usuário não encontrado!' });
    }
    return userExist;
  }
}
