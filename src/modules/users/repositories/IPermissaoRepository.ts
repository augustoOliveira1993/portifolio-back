import {
  IPermissaoDTO,
  IPermissaoDocument,
} from '@modules/users/dto/IPermissaoDTO';
import IBaseRepository from '@shared/infra/database/mongo/IBaseRepository';

export default interface IPermissaoRepository extends IBaseRepository<
  IPermissaoDTO,
  IPermissaoDocument
> {
  findByName(name: string): Promise<IPermissaoDocument | null>;
}
