import { Router } from 'express';
import LogController from '@modules/log/infra/https/controllers/LogController';
import { verifyToken } from '@shared/middlewares/authMiddleware';

const router = Router();
const controller = new LogController();

router.use((req, res, next) => {
  res.header(
    'Access-Control-Allow-Headers',
    'x-access-token, Origin, Content-Type, Accept',
  );
  next();
});

router.post('/', [verifyToken], controller.create);

router.get('/', [verifyToken], controller.findAll);

router.get(
  '/last-registro',
  [verifyToken],
  controller.getLastRegistroByCategory,
);

router.get('/:id', [verifyToken], controller.findById);

router.put('/:id', [verifyToken], controller.update);

router.delete('/:id', [verifyToken], controller.delete);

export default router;
