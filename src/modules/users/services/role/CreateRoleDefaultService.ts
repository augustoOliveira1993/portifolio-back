import { injectable, inject } from 'tsyringe';
import {
  EDescrocapRoleDefault,
  ENameRoleDefault,
  IRoleDTO,
} from '../../dto/IRoleDTO';
import IRoleRepository from '../../repositories/IRoleRepository';
import { logger } from '@shared/utils/logger';

@injectable()
export default class CreateRoleDefaultService {
  constructor(
    @inject('RoleRepository')
    private repository: IRoleRepository,
  ) {}

  public async execute() {
    const [adminRole, userRole] = await Promise.all([
      this.repository.findByName(ENameRoleDefault.Administrador),
      this.repository.findByName(ENameRoleDefault.Usuario),
    ]);

    if (!adminRole) {
      logger.info('Criando role de Administrador');
      await this.repository.create({
        name: ENameRoleDefault.Administrador,
        description: EDescrocapRoleDefault.Administrador,
      } as IRoleDTO);
    }

    if (!userRole) {
      logger.info('Criando role de Usuário');
      await this.repository.create({
        name: ENameRoleDefault.Usuario,
        description: EDescrocapRoleDefault.Usuario,
      } as IRoleDTO);
    }

    return {
      success: true,
      message: 'Roles criadas com sucesso!',
    };
  }
}
