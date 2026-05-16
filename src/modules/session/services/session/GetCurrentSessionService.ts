import { inject, injectable } from 'tsyringe';
import ISessionRepository from '@modules/session/repositories/ISessionRepository';
import { ISessionDTO } from '@modules/session/dto/ISessionDTO';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
export default class GetCurrentSessionService {
  constructor(
    @inject('SessionRepository')
    private sessionRepository: ISessionRepository,
  ) {}

  async execute(sessionId: string): Promise<ISessionDTO> {
    const session = await this.sessionRepository.findById(sessionId);

    if (!session) {
      throw new NotFoundError({
        message: 'Sessão não encontrada ou expirada',
        title: 'Sessão Inválida',
      });
    }

    return session;
  }
}
