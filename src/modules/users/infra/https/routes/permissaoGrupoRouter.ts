import { Router } from 'express';
import PermissaoGrupoController from '@modules/users/infra/https/controllers/PermissaoGrupoController';
import { verifyToken } from '@shared/middlewares/authMiddleware';

const permissaoGruposRouter = Router();
const controller = new PermissaoGrupoController();

permissaoGruposRouter.use((req, res, next) => {
  res.header(
    'Access-Control-Allow-Headers',
    'x-access-token, Origin, Content-Type, Accept',
  );
  next();
});

permissaoGruposRouter.post('/', [verifyToken], controller.create);

permissaoGruposRouter.get('/', [verifyToken], controller.findAll);

permissaoGruposRouter.get('/:id', [verifyToken], controller.findById);

permissaoGruposRouter.put('/:id', [verifyToken], controller.update);

permissaoGruposRouter.delete('/:id', [verifyToken], controller.delete);

export default permissaoGruposRouter;
