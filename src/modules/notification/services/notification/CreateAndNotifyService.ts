import { SocketEvents, SocketManager } from '@shared/socket/SocketManager';
import { injectable, inject } from 'tsyringe';
import { INotificationDTO } from '../../dto/INotificationDTO';
import INotificationRepository from '../../repositories/INotificationRepository';
import moment from 'moment-timezone';

@injectable()
export default class CreateAndNotifyService {
  constructor(
    @inject('NotificationRepository')
    private repository: INotificationRepository,
  ) {}

  public async execute(
    data: INotificationDTO,
    option: {
      userEmail?: string;
      isPermitDuplicate?: boolean;
    } = {
      isPermitDuplicate: false,
    },
  ) {
    const expireAt = moment().add(7, 'days');
    if (!option.isPermitDuplicate) {
      const exitNotify = await this.repository.findOne({
        message: data.message,
        type: data.type,
        is_read: false,
      });
      if (!exitNotify) {
        const created = await this.repository.create({
          ...data,
          created_by: option?.userEmail,
          expiresAt: expireAt.toDate(),
        });

        SocketManager.getInstance().emit(
          SocketEvents.NOTIFICACAO,
          JSON.stringify(created),
        );
      }

      return {
        success: true,
        message: 'Notification criada com sucesso!',
        isPermitDuplicate: true,
      };
    }

    const created = await this.repository.create({
      ...data,
      created_by: option?.userEmail,
      expiresAt: expireAt.toDate(),
    });
    const io = SocketManager.getInstance();
    io.emit(SocketEvents.NOTIFICACAO, JSON.stringify(created));

    return {
      success: true,
      message: 'Notification criada com sucesso!',
      isPermitDuplicate: false,
    };
  }
}
