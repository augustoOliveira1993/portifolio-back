import { injectable, inject } from 'tsyringe';
import IContactRepository from '@modules/contact/repositories/IContactRepository';
import { IContactDocument } from '@modules/contact/dto/IContactDTO';
import { IPaginatedResult, applyPaginationParams, buildPaginatedResult } from '@shared/utils/pagination';

@injectable()
export default class FindAllService {
  constructor(
    @inject('ContactRepository')
    private repository: IContactRepository,
  ) {}

  public async execute(
    query: Record<string, any>,
  ): Promise<IPaginatedResult<IContactDocument>> {
    let queryParams: Record<string, any> = {};

    queryParams = applyPaginationParams(query, queryParams);

    const [total, data] = await Promise.all([
      this.repository.total(queryParams),
      this.repository.findAll({ ...queryParams, sortBy: 'createdAt', sortDesc: true }),
    ]);

    return buildPaginatedResult(data, total, query);
  }
}
