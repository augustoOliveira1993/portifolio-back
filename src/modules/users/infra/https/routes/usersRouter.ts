import { Router } from 'express';
import UsersController from '@modules/users/infra/https/controllers/UsersController';
import { verifyToken } from '@shared/middlewares/authMiddleware';

const router = Router();
const controller = new UsersController();

router.use((req, res, next) => {
  res.header(
    'Access-Control-Allow-Headers',
    'x-access-token, Origin, Content-Type, Accept',
  );
  next();
});

router.post('/', controller.create);

router.get('/test/user', [verifyToken], controller.getUserAuth);

router.get('/', [verifyToken], controller.findAll);

router.get('/:id', [verifyToken], controller.findById);

router.put('/:id', [verifyToken], controller.updateUser);

router.delete('/:id', [verifyToken], controller.delete);

router.put('/edit', [verifyToken], controller.update);

router.post(
  '/:id/permissions',
  [verifyToken],
  controller.addPermissionByUserId,
);

router.delete(
  '/:id/permissions',
  [verifyToken],
  controller.removePermissionByUserId,
);

export default router;
