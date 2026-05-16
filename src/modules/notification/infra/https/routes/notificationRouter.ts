import { Router } from 'express';
import NotificationController from '@modules/notification/infra/https/controllers/NotificationController';
import { verifyToken } from '@shared/middlewares/authMiddleware';

const router = Router();
const controller = new NotificationController();

router.use((req, res, next) => {
  res.header(
    'Access-Control-Allow-Headers',
    'x-access-token, Origin, Content-Type, Accept',
  );
  next();
});

router.post('/mark-all-read', [verifyToken], controller.redAllNotify);

router.post('/', [verifyToken], controller.create);

router.post('/created-end-notify', [verifyToken], controller.createAndNotify);

router.get('/', [verifyToken], controller.findAll);

router.get('/:id', [verifyToken], controller.findById);

router.post('/:id/read', [verifyToken], controller.redNotify);

router.put('/:id', [verifyToken], controller.update);

router.delete('/:id', [verifyToken], controller.delete);

export default router;
