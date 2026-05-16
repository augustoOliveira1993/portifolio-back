import { Router } from 'express';
import UsersController from '@modules/users/infra/https/controllers/UsersController';
import SessionController from '@modules/session/infra/https/controllers/SessionController';
import { verifyToken } from '@shared/middlewares/authMiddleware';
import verifySignUp from '../../../middleware/verifySignup';

const router = Router();
const usersController = new UsersController();
const sessionController = new SessionController();

router.use((req, res, next) => {
  res.header(
    'Access-Control-Allow-Headers',
    'x-access-token, Origin, Content-Type, Accept',
  );
  next();
});

// Rotas públicas
router.post(
  '/signup',
  [verifySignUp.checkDuplicateUsernameOrEmail],
  usersController.signup,
);

router.post('/signin', usersController.signin);

router.post('/refresh', usersController.refreshToken);

// Rotas protegidas
router.get('/me', [verifyToken], usersController.getMe);

router.get('/abilities', [verifyToken], usersController.getAbilityUserAuth);

// Rotas de sessão
router.get('/sessions', [verifyToken], sessionController.list);

router.get('/sessions/current', [verifyToken], sessionController.getCurrent);

router.delete('/logout', [verifyToken], sessionController.logout);

router.delete('/logout-all', [verifyToken], sessionController.logoutAll);

export default router;
