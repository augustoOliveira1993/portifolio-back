import { Router } from 'express';
import SessionController from '@modules/session/infra/https/controllers/SessionController';
import { verifyToken } from '@shared/middlewares/authMiddleware';

const router = Router();
const controller = new SessionController();

// Todas as rotas de sessão requerem autenticação
router.use(verifyToken);

/**
 * GET /sessions
 * Lista todas as sessões ativas do usuário logado
 */
router.get('/', controller.list);

/**
 * GET /sessions/current
 * Retorna detalhes da sessão atual
 */
router.get('/current', controller.getCurrent);

/**
 * DELETE /sessions/:sessionId
 * Faz logout de uma sessão específica
 */
router.delete('/:sessionId', controller.logout);

/**
 * DELETE /sessions
 * Faz logout de todas as sessões do usuário (exceto a atual, se desejado)
 */
router.delete('/', controller.logoutAll);

export default router;
