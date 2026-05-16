import { Router } from 'express';

import users from '@modules/users/infra/https/routes/usersRouter';
import roleRoutes from '@modules/users/infra/https/routes/rolesRouter';
import logRoutes from '@modules/log/infra/https/routes/logRouter';
import permissaoRoutes from '@modules/users/infra/https/routes/permissaoRouter';
import permissaoGrupoRoutes from '@modules/users/infra/https/routes/permissaoGrupoRouter';
import authRoles from '@modules/users/infra/https/routes/authRouter';
import notificationRouter from '@modules/notification/infra/https/routes/notificationRouter';
import blogPostRouter from '@modules/blogPost/infra/https/routes/blogPostRouter';
import certificationRouter from '@modules/certification/infra/https/routes/certificationRouter';
import contactRouter from '@modules/contact/infra/https/routes/contactRouter';
import educationRouter from '@modules/education/infra/https/routes/educationRouter';
import experienceRouter from '@modules/experience/infra/https/routes/experienceRouter';
import projectRouter from '@modules/project/infra/https/routes/projectRouter';
import skillRouter from '@modules/skill/infra/https/routes/skillRouter';
import uploadRouter from '@shared/infra/https/routes/uploadRouter';

const routes = Router();

routes.use('/auth', authRoles);
routes.use('/users', users);
routes.use('/roles', roleRoutes);
routes.use('/logs', logRoutes);
routes.use('/permissoes', permissaoRoutes);
routes.use('/permissao-grupos', permissaoGrupoRoutes);
routes.use('/notifications', notificationRouter);

routes.use('/blog-posts', blogPostRouter);
routes.use('/certifications', certificationRouter);
routes.use('/contact', contactRouter);
routes.use('/education', educationRouter);
routes.use('/experiences', experienceRouter);
routes.use('/projects', projectRouter);
routes.use('/skills', skillRouter);
routes.use('/upload', uploadRouter);

export default routes;
