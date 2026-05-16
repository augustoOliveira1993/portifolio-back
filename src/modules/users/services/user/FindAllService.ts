import { injectable, inject } from 'tsyringe';
import IUsersRepository from '../../repositories/IUsersRepository';
import { IResquestQuery, IUserDTO } from '@modules/users/dto/IUserDTO';
import { QueryOptions } from 'mongoose';
import IRoleRepository from '@modules/users/repositories/IRoleRepository';
import {
  applyPaginationParams,
  applySearchParam,
  buildPaginatedResult,
} from '@shared/utils/helpers';

@injectable()
export default class FindAllService {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,
    @inject('RoleRepository')
    private roleRepository: IRoleRepository,
  ) {}

  public async execute(query: QueryOptions<IUserDTO>) {
    let queryParams = {};

    if (query.searchRole) {
      const regexRole = new RegExp(query.searchRole, 'i');
      const rolesExist = await this.roleRepository.findAll({
        name: { $regex: regexRole },
      });
      queryParams = {
        ...queryParams,
        role: {
          $in: rolesExist?.map(role => role._id),
        },
      };
    }

    queryParams = applySearchParam(queryParams, query, {
      textFields: ['username', 'email'],
    });

    queryParams = applyPaginationParams(queryParams, query);

    const [total, data] = await Promise.all([
      this.usersRepository.total(queryParams),
      this.usersRepository.findAll(queryParams),
    ]);

    return buildPaginatedResult(data, total, query.page);
  }
}
