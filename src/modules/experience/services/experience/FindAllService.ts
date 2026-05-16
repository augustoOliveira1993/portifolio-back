import { injectable, inject } from 'tsyringe';
import IExperienceRepository from '@modules/experience/repositories/IExperienceRepository';
import { IExperienceDocument } from '@modules/experience/dto/IExperienceDTO';
import { IPaginatedResult, applyPaginationParams, buildPaginatedResult } from '@shared/utils/pagination';
import { applySearchParam } from '@shared/utils/search';

@injectable()
export default class FindAllService {
  constructor(
    @inject('ExperienceRepository')
    private repository: IExperienceRepository,
  ) {}

  public async execute(
    query: Record<string, any>,
  ): Promise<IPaginatedResult<IExperienceDocument>> {
    let queryParams: Record<string, any> = {};

    queryParams = applySearchParam(query, queryParams, {
      textFields: ['company', 'role', 'description'],
    });

    queryParams = applyPaginationParams(query, queryParams);

    const [total, data] = await Promise.all([
      this.repository.total(queryParams),
      this.repository.findAll({ ...queryParams, sortBy: 'order', sortDesc: false }),
    ]);

    return buildPaginatedResult(data, total, query);
  }
}
