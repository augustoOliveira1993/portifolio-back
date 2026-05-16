import { injectable, inject } from 'tsyringe';
import { ILogDTO } from '../../dto/ILogDTO';
import ILogRepository from '../../repositories/ILogRepository';
import { QueryOptions } from 'mongoose';
import { create } from 'domain';

@injectable()
export default class FindAllService {
  constructor(
    @inject('LogRepository')
    private repository: ILogRepository,
  ) {}

  public async execute(query: QueryOptions<ILogDTO>) {
    let queryParams: any = {
      sortBy: { createdAt: -1 },
    };
    if (query.search) {
      queryParams = {
        ...queryParams,
        name: { $regex: query.search, $options: 'i' },
      };
    }

    if (query.category) {
      queryParams = {
        ...queryParams,
        category: { $regex: query.category, $options: 'i' },
      };
    }
    return {
      total: await this.repository.count(queryParams),
      data: await this.repository.findAll(queryParams),
    };
  }
}
