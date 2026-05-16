import { injectable, inject } from 'tsyringe';
import { IRoleDTO } from '../../dto/IRoleDTO';
import IRoleRepository from '../../repositories/IRoleRepository';
import { QueryOptions } from 'mongoose';
import { applySearchParam, buildPaginatedResult } from '@shared/utils/helpers';

@injectable()
export default class FindAllService {
  constructor(
    @inject('RoleRepository')
    private repository: IRoleRepository,
  ) {}

  public async execute(query: QueryOptions<IRoleDTO>) {
    let queryParams = {};

    queryParams = applySearchParam(query, queryParams, {
      textFields: ['name'],
    });
    const [total, data] = await Promise.all([
      this.repository.total(queryParams),
      this.repository.findAll(queryParams),
    ]);
    return buildPaginatedResult(data, total, query);
  }
}
