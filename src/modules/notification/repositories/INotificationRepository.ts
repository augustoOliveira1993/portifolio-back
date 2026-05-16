import {
  INotificationDTO,
  INotificationDocument,
} from '@modules/notification/dto/INotificationDTO';
import IBaseRepository from '@shared/infra/database/mongo/IBaseRepository';

export default interface INotificationRepository extends IBaseRepository<
  INotificationDTO,
  INotificationDocument
> {}
