import { inject, injectable } from 'tsyringe';
import ISessionRepository from '@modules/session/repositories/ISessionRepository';
import { logger } from '@shared/utils/logger';

@injectable()
export default class LogoutAllSessionsService {
  constructor(
    @inject('SessionRepository')
    private sessionRepository: ISessionRepository,
  ) {}

  async execute(userId: string): Promise<number> {
    logger.info(`Iniciando logout de todas as sessões do usuário ${userId}`);

    // Busca todas as sessões antes de invalidar para contar
    const sessions = await this.sessionRepository.findByUserId(userId);
    const sessionCount = sessions.length;

    // Invalida todas as sessões
    await this.sessionRepository.invalidateAll(userId);

    logger.info(
      `${sessionCount} sessão(ões) invalidada(s) para usuário ${userId}`,
    );

    return sessionCount;
  }
}
