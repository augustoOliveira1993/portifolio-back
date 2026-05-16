import { Router } from 'express';
import PermissaoController from '@modules/users/infra/https/controllers/PermissaoController';
import { verifyToken } from '@shared/middlewares/authMiddleware';

const permissoesRouter = Router();
const controller = new PermissaoController();

permissoesRouter.use((req, res, next) => {
  res.header(
    'Access-Control-Allow-Headers',
    'x-access-token, Origin, Content-Type, Accept',
  );
  next();
});

permissoesRouter.post('/', [verifyToken], controller.create);

permissoesRouter.get('/', [verifyToken], controller.findAll);

permissoesRouter.get('/:id', [verifyToken], controller.findById);

permissoesRouter.put('/:id', [verifyToken], controller.update);

permissoesRouter.delete('/:id', [verifyToken], controller.delete);

export default permissoesRouter;
