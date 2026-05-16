import { Router } from 'express';
import ProjectController from '@modules/project/infra/https/controllers/ProjectController';
import { verifyToken } from '@shared/middlewares/authMiddleware';

const router = Router();
const controller = new ProjectController();

router.use((req, res, next) => {
  res.header(
    'Access-Control-Allow-Headers',
    'x-access-token, Origin, Content-Type, Accept',
  );
  next();
});

router.get('/', controller.findAll.bind(controller));
router.get('/:id', controller.findById.bind(controller));
router.post('/', [verifyToken], controller.create.bind(controller));
router.put('/:id', [verifyToken], controller.update.bind(controller));
router.delete('/:id', [verifyToken], controller.delete.bind(controller));

export default router;
