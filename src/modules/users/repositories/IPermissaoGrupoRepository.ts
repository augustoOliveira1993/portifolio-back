import {
  IPermissaoGrupoDTO,
  IPermissaoGrupoDocument,
} from '@modules/users/dto/IPermissaoGrupoDTO';
import IBaseRepository from '@shared/infra/database/mongo/IBaseRepository';

export default interface IPermissaoGrupoRepository extends IBaseRepository<
  IPermissaoGrupoDTO,
  IPermissaoGrupoDocument
> {
  findByName(name: string): Promise<IPermissaoGrupoDocument | null>;
}
