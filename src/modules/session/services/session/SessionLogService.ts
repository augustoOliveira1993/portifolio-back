import { inject, injectable } from 'tsyringe';
import ILogRepository from '@modules/log/repositories/ILogRepository';
import { ISessionDTO } from '@modules/session/dto/ISessionDTO';
import { logger } from '@shared/utils/logger';
import { LogCategory, LogAction } from '@modules/log/dto/ILogDTO';

interface ILogLoginData {
  session: ISessionDTO;
}

interface ILogLogoutData {
  session: ISessionDTO;
  sessionDuration?: number; // em milissegundos
}

interface ILogAccessDeniedData {
  email?: string;
  ip: string;
  userAgent: string;
  reason: string;
  endpoint?: string;
}

@injectable()
export default class SessionLogService {
  constructor(
    @inject('LogRepository')
    private logRepository: ILogRepository,
  ) {}

  /**
   * Registra log de login bem-sucedido
   */
  async logLogin(data: ILogLoginData): Promise<void> {
    try {
      const { session } = data;

      const locationInfo = session.location
        ? `${session.location.city}, ${session.location.region} - ${session.location.country}`
        : 'Localização não disponível';

      await this.logRepository.create({
        action: LogAction.LOGIN,
        category: LogCategory.SESSION_LOG,
        message: `Login realizado com sucesso - ${locationInfo}`,
        created_by: session.email,
        ip: session.ip,
        userAgent: session.userAgent,
        sessionId: session.sessionId,
        metadata: {
          location: session.location,
          createdAt: session.createdAt,
          expiresAt: session.expiresAt,
        },
      });

      logger.info(
        `Log de login registrado para ${session.email} - SessionId: ${session.sessionId}`,
      );
    } catch (error) {
      logger.error(`Erro ao registrar log de login: ${error}`);
    }
  }

  /**
   * Registra log de logout
   */
  async logLogout(data: ILogLogoutData): Promise<void> {
    try {
      const { session, sessionDuration } = data;

      const durationInfo = sessionDuration
        ? this.formatDuration(sessionDuration)
        : 'Duração não calculada';

      await this.logRepository.create({
        action: LogAction.LOGOUT,
        category: LogCategory.SESSION_LOG,
        message: `Logout realizado - Duração da sessão: ${durationInfo}`,
        created_by: session.email,
        ip: session.ip,
        userAgent: session.userAgent,
        sessionId: session.sessionId,
        metadata: {
          sessionDuration,
          createdAt: session.createdAt,
          lastActivityAt: session.lastActivityAt,
        },
      });

      logger.info(
        `Log de logout registrado para ${session.email} - SessionId: ${session.sessionId}`,
      );
    } catch (error) {
      logger.error(`Erro ao registrar log de logout: ${error}`);
    }
  }

  /**
   * Registra log de acesso negado
   */
  async logAccessDenied(data: ILogAccessDeniedData): Promise<void> {
    try {
      const { email, ip, userAgent, reason, endpoint } = data;

      await this.logRepository.create({
        action: LogAction.ACCESS_DENIED,
        category: LogCategory.SESSION_LOG,
        message: `Acesso negado: ${reason}`,
        created_by: email || 'Não autenticado',
        ip,
        userAgent,
        endpoint,
        metadata: {
          reason,
          timestamp: new Date(),
        },
      });

      logger.warn(
        `Log de acesso negado registrado - Email: ${email || 'N/A'}, Razão: ${reason}`,
      );
    } catch (error) {
      logger.error(`Erro ao registrar log de acesso negado: ${error}`);
    }
  }

  /**
   * Registra log de sessão expirada
   */
  async logSessionExpired(data: {
    sessionId: string;
    email: string;
    ip: string;
  }): Promise<void> {
    try {
      await this.logRepository.create({
        action: LogAction.SESSION_EXPIRED,
        category: LogCategory.SESSION_LOG,
        message: 'Sessão expirada automaticamente',
        created_by: data.email,
        ip: data.ip,
        sessionId: data.sessionId,
        metadata: {
          timestamp: new Date(),
        },
      });

      logger.info(
        `Log de sessão expirada registrado - SessionId: ${data.sessionId}`,
      );
    } catch (error) {
      logger.error(`Erro ao registrar log de sessão expirada: ${error}`);
    }
  }

  /**
   * Formata duração em milissegundos para string legível
   */
  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h ${minutes % 60}m`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  }
}
