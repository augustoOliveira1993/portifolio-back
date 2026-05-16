import { injectable, inject } from 'tsyringe';
import { INotificationDocument } from '../../dto/INotificationDTO';
import INotificationRepository from '../../repositories/INotificationRepository';
import RedisClient from '@configs/redis.config';

const cache = RedisClient.for('/notifications');

@injectable()
class CreateService {
  constructor(
    @inject('NotificationRepository')
    private repository: INotificationRepository,
  ) { }

  public async execute(
    data: INotificationDocument,
    userEmail: string | undefined,
  ) {
    const created = await this.repository.create({
      ...data,
      created_by: userEmail,
    });

    await cache.invalidate();

    return {
      success: true,
      message: 'Notification criada com sucesso!',
      data: created,
    };
  }
}

export default CreateService;
