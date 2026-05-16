import { injectable } from 'tsyringe';
import { NotFoundError } from '@shared/errors/AppError';
import { Log } from '@modules/log/infra/mongo/models/Log';
import { QueryOptions } from 'mongoose';
import { ILogDTO } from '@modules/log/dto/ILogDTO';

@injectable()
class GetLastRegistroByCategoryService {
  constructor() {}

  public async execute(query: QueryOptions<ILogDTO>) {
    let queryParams = {};
    if (query.category) {
      let regex = new RegExp(query.category, 'i');
      queryParams = {
        ...queryParams,
        category: { $regex: regex },
      };
    }

    if (query.created_by) {
      let regex = new RegExp(query.created_by, 'i');
      queryParams = {
        ...queryParams,
        created_by: { $regex: regex },
      };
    }
    const logExist = await Log.findOne(queryParams).sort({ updatedAt: -1 });
    if (!logExist) {
      throw new NotFoundError({ message: 'Nenhum Log encontrada' });
    }
    return logExist;
  }
}

export default GetLastRegistroByCategoryService;
