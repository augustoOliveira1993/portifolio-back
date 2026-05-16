import { injectable, inject } from 'tsyringe';
import { IResquestQuery } from '../../dto/IPermissaoGrupoDTO';
import IPermissaoGrupoRepository from '../../repositories/IPermissaoGrupoRepository';

@injectable()
export default class FindAllService {
  constructor(
    @inject('PermissaoGrupoRepository')
    private repository: IPermissaoGrupoRepository,
  ) {}

  public async execute(query: IResquestQuery) {
    const data = await this.repository.findAll(query);
    return data;
  }
}
