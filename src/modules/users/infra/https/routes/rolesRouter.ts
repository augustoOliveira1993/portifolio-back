import { Router } from 'express';
import RoleController from '@modules/users/infra/https/controllers/RoleController';
import { verifyToken } from '@shared/middlewares/authMiddleware';

const rolesRouter = Router();
const controller = new RoleController();

rolesRouter.use((req, res, next) => {
  res.header(
    'Access-Control-Allow-Headers',
    'x-access-token, Origin, Content-Type, Accept',
  );
  next();
});

rolesRouter.post('/', [verifyToken], controller.create);

rolesRouter.get('/', [verifyToken], controller.findAll);

rolesRouter.get('/:idRole', [verifyToken], controller.findById);

rolesRouter.put('/:idRole', [verifyToken], controller.update);

rolesRouter.delete('/:idRole', [verifyToken], controller.delete);

rolesRouter.post('/:idRole/permissions', controller.addPermissionByRoleId);

export default rolesRouter;
