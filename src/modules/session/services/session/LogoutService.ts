import { inject, injectable } from 'tsyringe';
import ISessionRepository from '@modules/session/repositories/ISessionRepository';
import { logger } from '@shared/utils/logger';
import { NotFoundError } from '@shared/errors/AppError';

interface ILogoutRequest {
  sessionId: string;
  userId?: string; // Para validação de segurança
}

@injectable()
export default class LogoutService {
  constructor(
    @inject('SessionRepository')
    private sessionRepository: ISessionRepository,
  ) {}

  async execute(data: ILogoutRequest): Promise<void> {
    const { sessionId, userId } = data;

    logger.info(`Iniciando logout da sessão ${sessionId}`);

    // Busca a sessão
    const session = await this.sessionRepository.findById(sessionId);

    if (!session) {
      throw new NotFoundError({
        message: 'Sessão não encontrada ou já expirada',
        title: 'Sessão Inválida',
      });
    }

    // Valida se o usuário é dono da sessão (segurança)
    if (userId && session.userId !== userId) {
      logger.warn(
        `Tentativa de logout de sessão de outro usuário. UserId: ${userId}, Session UserId: ${session.userId}`,
      );
      throw new NotFoundError({
        message: 'Sessão não encontrada',
        title: 'Sessão Inválida',
      });
    }

    // Invalida a sessão
    await this.sessionRepository.invalidate(sessionId);

    logger.info(
      `Logout realizado com sucesso. SessionId: ${sessionId}, UserId: ${session.userId}`,
    );
  }
}
