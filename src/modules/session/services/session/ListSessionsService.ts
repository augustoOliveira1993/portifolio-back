import { inject, injectable } from 'tsyringe';
import ISessionRepository from '@modules/session/repositories/ISessionRepository';
import { ISessionDTO } from '@modules/session/dto/ISessionDTO';
import { logger } from '@shared/utils/logger';

@injectable()
export default class ListSessionsService {
  constructor(
    @inject('SessionRepository')
    private sessionRepository: ISessionRepository,
  ) {}

  async execute(userId: string): Promise<ISessionDTO[]> {
    logger.info(`Listando sessões ativas para usuário ${userId}`);

    const sessions = await this.sessionRepository.findByUserId(userId);

    // Filtra apenas sessões ainda válidas
    const activeSessions = sessions.filter(
      session => session.isActive && new Date() < session.expiresAt,
    );

    logger.info(
      `${activeSessions.length} sessão(ões) ativa(s) encontrada(s) para usuário ${userId}`,
    );

    return activeSessions;
  }
}
