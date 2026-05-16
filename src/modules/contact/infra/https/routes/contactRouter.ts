import { Router } from 'express';
import ContactController from '@modules/contact/infra/https/controllers/ContactController';
import { verifyToken } from '@shared/middlewares/authMiddleware';

const router = Router();
const controller = new ContactController();

router.use((req, res, next) => {
  res.header(
    'Access-Control-Allow-Headers',
    'x-access-token, Origin, Content-Type, Accept',
  );
  next();
});

router.post('/', controller.create.bind(controller));
router.get('/', [verifyToken], controller.findAll.bind(controller));
router.patch('/:id/status', [verifyToken], controller.updateStatus.bind(controller));
router.delete('/:id', [verifyToken], controller.delete.bind(controller));

export default router;
