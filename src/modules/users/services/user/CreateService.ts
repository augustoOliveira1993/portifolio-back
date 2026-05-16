import bcrypt from 'bcryptjs';
import { injectable, inject } from 'tsyringe';
import { IUserDTO } from '../../dto/IUserDTO';
import IUsersRepository from '../../repositories/IUsersRepository';
import { ConflictError } from '@shared/errors/AppError';
import { logger } from '@shared/utils/logger';
import authConfig from '@configs/auth/jwt.config';
import IRoleRepository from '@modules/users/repositories/IRoleRepository';
import {
  EDescrocapRoleDefault,
  ENameRoleDefault,
} from '@modules/users/dto/IRoleDTO';
@injectable()
export default class CreateService {
  constructor(
    @inject('UsersRepository')
    private repository: IUsersRepository,
    @inject('RoleRepository')
    private roleRepository: IRoleRepository,
  ) { }

  public async execute(data: IUserDTO) {
    const emailExist = await this.repository.findByEmail(data.email);
    if (emailExist) {
      throw new ConflictError({ message: 'O email já existe' });
    }

    if (!data.password) {
      logger.info(`Senha não informada para o usuário ${data.email}`);
      data.password = authConfig.password_default!;
    }

    const hashedPassword = bcrypt.hashSync(data.password, 8);

    let roleDefault = await this.roleRepository.findOne({
      name: ENameRoleDefault.Usuario,
    });

    if (!roleDefault) {
      roleDefault = await this.roleRepository.create({
        name: ENameRoleDefault.Usuario,
        description: EDescrocapRoleDefault.Usuario,
      });
    }
    const created = await this.repository.create({
      ...data,
      password: hashedPassword,
      role: roleDefault,
    });
    return {
      success: true,
      message: 'Usuário criado com sucesso!',
      data: created,
    };
  }
}
