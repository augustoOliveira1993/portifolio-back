import { Request, Response } from 'express';
import { container } from 'tsyringe';
import ListSessionsService from '@modules/session/services/session/ListSessionsService';
import LogoutService from '@modules/session/services/session/LogoutService';
import LogoutAllSessionsService from '@modules/session/services/session/LogoutAllSessionsService';
import GetCurrentSessionService from '@modules/session/services/session/GetCurrentSessionService';
import SessionLogService from '@modules/session/services/session/SessionLogService';
import ISessionRepository from '@modules/session/repositories/ISessionRepository';

export default class SessionController {
  /**
   * GET /sessions
   * Lista todas as sessões ativas do usuário logado
   */
  public async list(req: Request, res: Response): Promise<Response> {
    const userId = req.userId!;
    const service = container.resolve(ListSessionsService);
    const sessions = await service.execute(userId);
    return res.status(200).json(sessions);
  }

  /**
   * GET /sessions/current
   * Retorna detalhes da sessão atual
   */
  public async getCurrent(req: Request, res: Response): Promise<Response> {
    const sessionId = req.sessionId;

    if (!sessionId) {
      return res.status(400).json({
        message: 'SessionId não encontrado no token',
      });
    }

    const service = container.resolve(GetCurrentSessionService);
    const session = await service.execute(sessionId);
    return res.status(200).json(session);
  }

  /**
   * DELETE /logout
   * Faz logout da sessão atual
   */
  public async logout(req: Request, res: Response): Promise<Response> {
    const sessionId = req.sessionId;
    const userId = req.userId!;

    if (!sessionId) {
      return res.status(400).json({
        message: 'SessionId não encontrado no token',
      });
    }

    const sessionRepository =
      container.resolve<ISessionRepository>('SessionRepository');
    const sessionLogService = container.resolve(SessionLogService);

    // Busca a sessão antes de invalidar (para registrar log)
    const session = await sessionRepository.findById(sessionId);

    const service = container.resolve(LogoutService);
    await service.execute({ sessionId, userId });

    // Registra log de logout se sessão foi encontrada
    if (session) {
      const sessionDuration =
        new Date().getTime() - session.createdAt.getTime();
      await sessionLogService.logLogout({ session, sessionDuration });
    }

    return res.status(200).json({
      message: 'Logout realizado com sucesso',
    });
  }

  /**
   * DELETE /sessions
   * Faz logout de todas as sessões do usuário
   */
  public async logoutAll(req: Request, res: Response): Promise<Response> {
    const userId = req.userId!;
    const service = container.resolve(LogoutAllSessionsService);
    const count = await service.execute(userId);

    return res.status(200).json({
      message: `${count} sessão(ões) encerrada(s) com sucesso`,
      count,
    });
  }
}
