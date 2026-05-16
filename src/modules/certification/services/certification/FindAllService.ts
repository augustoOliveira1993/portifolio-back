import { injectable, inject } from 'tsyringe';
import ICertificationRepository from '@modules/certification/repositories/ICertificationRepository';
import { ICertificationDocument } from '@modules/certification/dto/ICertificationDTO';
import { IPaginatedResult, applyPaginationParams, buildPaginatedResult } from '@shared/utils/pagination';
import { applySearchParam } from '@shared/utils/search';

@injectable()
export default class FindAllService {
  constructor(
    @inject('CertificationRepository')
    private repository: ICertificationRepository,
  ) {}

  public async execute(
    query: Record<string, any>,
  ): Promise<IPaginatedResult<ICertificationDocument>> {
    let queryParams: Record<string, any> = {};

    queryParams = applySearchParam(query, queryParams, {
      textFields: ['name', 'issuer'],
    });

    queryParams = applyPaginationParams(query, queryParams);

    const [total, data] = await Promise.all([
      this.repository.total(queryParams),
      this.repository.findAll({ ...queryParams, sortBy: 'order', sortDesc: false }),
    ]);

    return buildPaginatedResult(data, total, query);
  }
}
