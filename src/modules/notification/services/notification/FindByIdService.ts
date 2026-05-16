import { injectable, inject } from 'tsyringe';
import INotificationRepository from '../../repositories/INotificationRepository';
import { NotFoundError } from '@shared/errors/AppError';
import RedisClient from '@configs/redis.config';

const cache = RedisClient.for('/notifications', 120);

@injectable()
class FindByIdService {
  constructor(
    @inject('NotificationRepository')
    private repository: INotificationRepository,
  ) { }

  public async execute(id: string) {
    return cache.rememberById(id, async () => {
      const notification = await this.repository.findById(id);
      if (!notification) {
        throw new NotFoundError({ message: 'Notification não encontrada' });
      }
      return notification;
    });
  }
}

export default FindByIdService;
