import { injectable, inject } from 'tsyringe';
import ISkillRepository from '@modules/skill/repositories/ISkillRepository';
import { ISkillDocument } from '@modules/skill/dto/ISkillDTO';
import { IPaginatedResult, applyPaginationParams, buildPaginatedResult } from '@shared/utils/pagination';
import { applySearchParam } from '@shared/utils/search';

@injectable()
export default class FindAllService {
  constructor(
    @inject('SkillRepository')
    private repository: ISkillRepository,
  ) {}

  public async execute(
    query: Record<string, any>,
  ): Promise<IPaginatedResult<ISkillDocument>> {
    let queryParams: Record<string, any> = {};

    queryParams = applySearchParam(query, queryParams, {
      textFields: ['name'],
    });

    queryParams = applyPaginationParams(query, queryParams);

    const [total, data] = await Promise.all([
      this.repository.total(queryParams),
      this.repository.findAll({ ...queryParams, sortBy: 'order', sortDesc: false }),
    ]);

    return buildPaginatedResult(data, total, query);
  }
}
