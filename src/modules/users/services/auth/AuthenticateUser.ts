import bcrypt from 'bcryptjs';
import config from '@configs/auth/jwt.config';
import { BadRequestError, UnauthorizedError } from '@shared/errors/AppError';

import { User } from '@modules/users/infra/mongo/models/User';
import IRoleRepository from '@modules/users/repositories/IRoleRepository';
import ActiveDirectory from 'activedirectory';
import {
  generateToken,
  generateRefreshToken,
} from '@modules/users/middleware/authJWT';
import { container, inject, injectable } from 'tsyringe';
import IUsersRepository from '@modules/users/repositories/IUsersRepository';
import RecordAttemptService from '../block/RecordAttemptService';
import CreateRoleDefaultService from '../role/CreateRoleDefaultService';
import { ENameRoleDefault } from '@modules/users/dto/IRoleDTO';
import ResetAttemptsService from '../block/ResetAttemptsService';
import ISessionRepository from '@modules/session/repositories/ISessionRepository';
import GetLocationByIpService from '@modules/session/services/session/GetLocationByIpService';
import SessionLogService from '@modules/session/services/session/SessionLogService';
import { parseExpirationTime } from '@configs/auth/jwt.config';

interface IAuthenticateRequest {
  email: string;
  password: string;
  ip?: string;
  userAgent?: string;
}

interface ITokenPayload {
  id: string;
  email: string;
  role: string;
  is_admin: boolean;
  expire_at: string;
  sessionId: string;
}

interface IAuthResponse {
  token: string;
  refreshToken: string;
  username?: string;
  role: any;
  permissaos?: any[];
  email: string;
  pagina_inicial?: string;
  setor?: string;
  avatar_url?: string;
  isAdmin: boolean;
  ability?: any;
  tempo_expiracao_token: string | null;
  _id: any;
  status?: string;
  sessionId: string;
}

@injectable()
class AuthService {
  private activeDirectory: ActiveDirectory;

  constructor(
    @inject('UsersRepository') private usersRepository: IUsersRepository,
    @inject('RoleRepository') private roleRepository: IRoleRepository,
  ) {
    this.activeDirectory = new ActiveDirectory({
      url: process.env.AD_URL!,
      baseDN: process.env.DOMAIN_CONTROLLER!,
    });
  }

  /**
   * Centraliza a construção do payload do token JWT
   */
  private async buildTokenPayload(
    user: any,
    roleString: string,
    sessionId: string,
  ): Promise<ITokenPayload> {
    return {
      id: user.id,
      email: user.email,
      role: roleString,
      is_admin: (await this.usersRepository.isAdmin(user.email)) ?? false,
      expire_at: user?.tempo_expiracao_token || config.expiresInRefreshToken,
      sessionId,
    };
  }

  /**
   * Centraliza a construção da resposta de autenticação
   */
  private async buildAuthResponse(
    user: any,
    token: string,
    refreshToken: string,
    sessionId: string,
    abilityUser: any,
  ): Promise<IAuthResponse> {
    return {
      token,
      refreshToken,
      username: user.username,
      role: user.role,
      permissaos: user.permissaos,
      email: user.email,
      pagina_inicial: user.pagina_inicial,
      setor: user.setor,
      avatar_url: user.avatar_url,
      isAdmin: (await this.usersRepository.isAdmin(user.email)) ?? false,
      ability: abilityUser,
      tempo_expiracao_token: user?.tempo_expiracao_token || null,
      _id: user._id,
      status: user.status,
      sessionId,
    };
  }

  /**
   * Cria sessão e gera tokens (lógica centralizada)
   */
  private async createSessionAndGenerateTokens(
    user: any,
    roleString: string,
    ip: string,
    userAgent: string,
    abilityUser: any,
  ): Promise<IAuthResponse> {
    try {
      // Resolve dependências
      const sessionRepository =
        container.resolve<ISessionRepository>('SessionRepository');
      const getLocationService = container.resolve(GetLocationByIpService);
      const sessionLogService = container.resolve(SessionLogService);

      // Busca geolocalização
      const location = await getLocationService.execute(ip);

      // Calcula tempo de expiração em milissegundos
      const expiresIn = parseExpirationTime(
        user?.tempo_expiracao_token || '8h',
        'milliseconds',
      );

      await sessionRepository.invalidateAll(user._id.toString());

      const session = await sessionRepository.create({
        userId: user._id.toString(),
        email: user.email,
        ip,
        userAgent,
        location: location || undefined,
        expiresIn,
      });

      // Registra log de login
      await sessionLogService.logLogin({ session });

      // Gera payload centralizado
      const payload = await this.buildTokenPayload(
        user,
        roleString,
        session.sessionId,
      );

      // Gera tokens
      const token = generateToken(payload);
      const refreshToken = generateRefreshToken(payload);

      // Retorna resposta centralizada
      return this.buildAuthResponse(
        user,
        token,
        refreshToken,
        session.sessionId,
        abilityUser,
      );
    } catch (error) {
      console.error(`[AUTH] ERRO ao criar sessão:`, error);
      throw error;
    }
  }

  private authenticateWithAD(
    email: string,
    password: string,
    ip: string,
    userAgent: string,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.activeDirectory.authenticate(
        email,
        password,
        async (err: Error | null, auth: boolean) => {
          if (err) {
            const recordAttemptService =
              container.resolve(RecordAttemptService);
            await recordAttemptService.execute(email);
            return reject(
              new UnauthorizedError({
                message: err.message,
                title: 'Falha na autenticação!',
              }),
            );
          }

          if (auth) {
            let user = await this.usersRepository.findByEmail(email);
            let roleIdDefault = await this.roleRepository.findByName(
              ENameRoleDefault.Usuario,
            );

            if (!user) {
              user = await User.create({
                email,
                password: bcrypt.hashSync(password, 8),
                role: roleIdDefault?._id.toString() || '',
                status: 'ATIVO',
                pagina_inicial: '/',
                tempo_expiracao_token: '8h',
                username: email?.split('@')[0]?.replace('.', ' '),
              });
            }

            const abilityUser =
              await this.usersRepository.getAbilitiesUser(email);

            // Garante que role seja sempre uma string
            const roleString = user.role
              ? typeof user.role === 'string'
                ? user.role
                : (user.role as any)?._id?.toString() || String(user.role)
              : '';

            const resetAttemptsService =
              container.resolve(ResetAttemptsService);
            await resetAttemptsService.execute(email);

            // Cria sessão e gera tokens (centralizado)
            const authResponse = await this.createSessionAndGenerateTokens(
              user,
              roleString,
              ip,
              userAgent,
              abilityUser,
            );

            return resolve(authResponse);
          }
        },
      );
    });
  }

  private async authenticateLocal(
    email: string,
    password: string,
    ip: string,
    userAgent: string,
  ): Promise<any> {
    const user = await this.usersRepository.findByEmail(email);
    if (!user) {
      throw new BadRequestError({
        message: 'Senha ou E-mail Inválida',
        title: 'Falha na autenticação!',
      });
    }

    const passwordIsValid = bcrypt.compareSync(
      password,
      user?.password || (config.password_default as string),
    );

    if (!passwordIsValid) {
      const recordAttemptService = container.resolve(RecordAttemptService);
      await recordAttemptService.execute(email);
      throw new BadRequestError({
        message: 'Senha ou E-mail Inválida',
        title: 'Falha na autenticação!',
      });
    }

    // Garante que role seja sempre uma string
    const roleString = user.role
      ? typeof user.role === 'string'
        ? user.role
        : (user.role as any)?._id?.toString() || String(user.role)
      : '';

    const resetAttemptsService = container.resolve(ResetAttemptsService);
    await resetAttemptsService.execute(email);

    const abilityUser = await this.usersRepository.getAbilitiesUser(email);

    // Cria sessão e gera tokens (centralizado)
    return this.createSessionAndGenerateTokens(
      user,
      roleString,
      ip,
      userAgent,
      abilityUser,
    );
  }

  async authenticate(request: IAuthenticateRequest): Promise<any> {
    const {
      email,
      password,
      ip = 'IP não disponível',
      userAgent = 'User-Agent não disponível',
    } = request;

    const createRoleDefaultService = container.resolve(
      CreateRoleDefaultService,
    );
    await createRoleDefaultService.execute();
    const domain = email.split('@')[1];

    if (
      domain === process.env.DOMAIN_CONTROLLER &&
      email !== 'sincronismo@ferroeste.com.br'
    ) {
      return this.authenticateWithAD(email, password, ip, userAgent);
    }
    return this.authenticateLocal(email, password, ip, userAgent);
  }
}

export default AuthService;
