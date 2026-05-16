import { Model, QueryOptions } from 'mongoose';
import { Notification } from '@modules/notification/infra/mongo/models/Notification';
import {
  INotificationDTO,
  INotificationDocument,
} from '@modules/notification/dto/INotificationDTO';
import INotificationRepository from '@modules/notification/repositories/INotificationRepository';
import { BaseMongoRepository } from '@shared/infra/database/mongo/BaseMongoRepository';

export default class NotificationRepository
  extends BaseMongoRepository<INotificationDTO, INotificationDocument>
  implements INotificationRepository
{
  protected readonly model: Model<INotificationDocument> = Notification;
  protected readonly modelPopulated = [
    {
      path: 'user',
      select: 'username email',
    },
  ];
}
