import { container } from 'tsyringe';

import INotificationRepository from '@modules/notification/repositories/INotificationRepository';
import NotificationRepository from '@modules/notification/infra/mongo/repositories/NotificationRepository';

container.registerSingleton<INotificationRepository>('NotificationRepository', NotificationRepository);
