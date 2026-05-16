import { injectable, inject } from 'tsyringe';
import IEducationRepository from '@modules/education/repositories/IEducationRepository';
import { IEducationDocument } from '@modules/education/dto/IEducationDTO';
import { IPaginatedResult, applyPaginationParams, buildPaginatedResult } from '@shared/utils/pagination';
import { applySearchParam } from '@shared/utils/search';

@injectable()
export default class FindAllService {
  constructor(
    @inject('EducationRepository')
    private repository: IEducationRepository,
  ) {}

  public async execute(
    query: Record<string, any>,
  ): Promise<IPaginatedResult<IEducationDocument>> {
    let queryParams: Record<string, any> = {};

    queryParams = applySearchParam(query, queryParams, {
      textFields: ['institution', 'degree', 'fieldOfStudy'],
    });

    queryParams = applyPaginationParams(query, queryParams);

    const [total, data] = await Promise.all([
      this.repository.total(queryParams),
      this.repository.findAll({ ...queryParams, sortBy: 'order', sortDesc: false }),
    ]);

    return buildPaginatedResult(data, total, query);
  }
}
