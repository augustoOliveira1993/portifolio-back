import { injectable, inject } from 'tsyringe';
import { INotificationDTO } from '../../dto/INotificationDTO';
import INotificationRepository from '../../repositories/INotificationRepository';
import { QueryOptions } from 'mongoose';
import moment from 'moment-timezone';
import {
  applyPaginationParams,
  applySearchParam,
  buildPaginatedResult,
} from '@shared/utils/helpers';
import RedisClient from '@configs/redis.config';

const cache = RedisClient.for('/notifications', 60);

@injectable()
export default class FindAllService {
  constructor(
    @inject('NotificationRepository')
    private repository: INotificationRepository,
  ) { }

  public async execute(query: QueryOptions<INotificationDTO>) {
    return cache.remember(query as object, async () => {
      let queryParams: any = {
        $or: [
          { expitaAt: { $gte: moment().tz('America/Sao_Paulo').toDate() } },
          { is_read: false },
        ],
      };

      if (query.category) {
        queryParams = {
          ...queryParams,
          category: { $regex: query.category, $options: 'i' },
        };
      }

      queryParams = applySearchParam(query, queryParams, {
        textFields: ['name'],
      });

      queryParams = applyPaginationParams(query, queryParams);

      const [total, data] = await Promise.all([
        this.repository.total(queryParams),
        this.repository.findAll(queryParams),
      ]);

      return buildPaginatedResult(data, total, query);
    });
  }
}
