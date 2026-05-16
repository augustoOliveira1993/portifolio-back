import jwt from 'jsonwebtoken';
import { injectable, inject, container } from 'tsyringe';
import IUsersRepository from '../../repositories/IUsersRepository';
import { NotFoundError, UnauthorizedError } from '@shared/errors/AppError';
import {
  generateRefreshToken,
  generateToken,
} from '@modules/users/middleware/authJWT';
import config, { parseExpirationTime } from '@configs/auth/jwt.config';
import ResetAttemptsService from '../block/ResetAttemptsService';
import { ENameRoleDefault } from '@modules/users/dto/IRoleDTO';
import ISessionRepository from '@modules/session/repositories/ISessionRepository';

@injectable()
export default class RefreshTokenService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
  ) { }

  private isUserAdmin(user: any) {
    return user.role?.name === ENameRoleDefault.Administrador;
  }

  public async execute(
    refreshTokenBody: string,
    ip: string,
    userAgent: string,
  ) {
    return jwt.verify(
      refreshTokenBody,
      config.refreshSecret as string,
      async (err: any, decoded: any) => {
        if (err) {
          throw new UnauthorizedError({
            message: 'Token inválido!',
            title: 'Falha na autenticação',
          });
        }

        const userExist = await this.usersRepository.findById(decoded.id);
        if (!userExist) {
          throw new NotFoundError({ message: 'Usuário não encontrado!' });
        }

        const abilityUser = await this.usersRepository.getAbilitiesUser(
          userExist.email,
        );

        const roleString = userExist.role
          ? typeof userExist.role === 'string'
            ? userExist.role
            : (userExist.role as any)?._id?.toString() || String(userExist.role)
          : '';

        // Renova a sessão: invalida a anterior e cria uma nova
        const sessionRepository =
          container.resolve<ISessionRepository>('SessionRepository');

        if (decoded.sessionId) {
          await sessionRepository.invalidate(decoded.sessionId);
        }

        const expiresIn = parseExpirationTime(
          userExist?.tempo_expiracao_token || '8h',
          'milliseconds',
        );

        const session = await sessionRepository.create({
          userId: userExist._id.toString(),
          email: userExist.email,
          ip,
          userAgent,
          expiresIn,
        });

        let payload = {
          id: userExist.id,
          email: userExist.email,
          role: roleString,
          is_admin: this.isUserAdmin(userExist),
          expire_at: userExist?.tempo_expiracao_token
            ? userExist?.tempo_expiracao_token
            : config.expiresInRefreshToken,
          sessionId: session.sessionId,
        };

        const token = generateToken(payload);

        const refreshToken = generateRefreshToken(payload);

        const resetAttemptsService = container.resolve(ResetAttemptsService);
        await resetAttemptsService.execute(payload.email);

        return {
          token,
          refreshToken,
          username: userExist.username,
          role: userExist.role,
          permissaos: userExist.permissaos,
          email: userExist.email,
          pagina_inicial: userExist.pagina_inicial,
          setor: userExist.setor,
          avatar_url: userExist.avatar_url,
          ability: abilityUser,
          _id: userExist._id,
          status: userExist.status,
          isAdmin: this.isUserAdmin(userExist),
          tempo_expiracao_token: userExist?.tempo_expiracao_token || null,
          sessionId: session.sessionId,
        };
      },
    );
  }
}
