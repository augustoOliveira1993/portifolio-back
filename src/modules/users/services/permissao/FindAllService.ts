import { injectable, inject } from 'tsyringe';
import { IPermissaoDTO, IResquestQuery } from '../../dto/IPermissaoDTO';
import IPermissaoRepository from '../../repositories/IPermissaoRepository';
import { QueryOptions } from 'mongoose';
import { applySearchParam, buildPaginatedResult } from '@shared/utils/helpers';

@injectable()
export default class FindAllService {
  constructor(
    @inject('PermissaoRepository')
    private repository: IPermissaoRepository,
  ) {}

  public async execute(query: QueryOptions<IPermissaoDTO>) {
    let queryParams = {};

    queryParams = applySearchParam(query, queryParams, {
      textFields: ['nome', 'descricao'],
    });
    const [total, data] = await Promise.all([
      this.repository.total(queryParams),
      this.repository.findAll(queryParams),
    ]);
    return buildPaginatedResult(data, total, query);
  }
}
