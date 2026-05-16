import { injectable, inject } from 'tsyringe';
import INotificationRepository from '../../repositories/INotificationRepository';
import { NotFoundError } from '@shared/errors/AppError';
import RedisClient from '@configs/redis.config';

const cache = RedisClient.for('/notifications');

@injectable()
class DeleteNotificationService {
  constructor(
    @inject('NotificationRepository')
    private repository: INotificationRepository,
  ) { }

  public async execute(id: string) {
    const roleDeleted = await this.repository.delete(id);
    if (!roleDeleted) {
      throw new NotFoundError({ message: 'Notification não encontrada' });
    }

    await cache.invalidate();

    return {
      success: true,
      message: 'Notification deletada com sucesso!',
      data: {
        id: roleDeleted.id,
      },
    };
  }
}

export default DeleteNotificationService;
