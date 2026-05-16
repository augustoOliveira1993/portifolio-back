import { injectable, inject } from 'tsyringe';
import IProjectRepository from '@modules/project/repositories/IProjectRepository';
import { IProjectDocument } from '@modules/project/dto/IProjectDTO';
import { IPaginatedResult, applyPaginationParams, buildPaginatedResult } from '@shared/utils/pagination';
import { applySearchParam } from '@shared/utils/search';

@injectable()
export default class FindAllService {
  constructor(
    @inject('ProjectRepository')
    private repository: IProjectRepository,
  ) {}

  public async execute(
    query: Record<string, any>,
  ): Promise<IPaginatedResult<IProjectDocument>> {
    let queryParams: Record<string, any> = {};

    queryParams = applySearchParam(query, queryParams, {
      textFields: ['title', 'description'],
    });

    queryParams = applyPaginationParams(query, queryParams);

    const [total, data] = await Promise.all([
      this.repository.total(queryParams),
      this.repository.findAll({ ...queryParams, sortBy: 'order', sortDesc: false }),
    ]);

    return buildPaginatedResult(data, total, query);
  }
}
