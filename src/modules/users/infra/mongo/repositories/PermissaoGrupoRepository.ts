import { Model } from 'mongoose';
import { PermissaoGrupo } from '@modules/users/infra/mongo/models/PermissaoGrupo';
import {
  IPermissaoGrupoDTO,
  IPermissaoGrupoDocument,
} from '@modules/users/dto/IPermissaoGrupoDTO';
import IPermissaoGrupoRepository from '@modules/users/repositories/IPermissaoGrupoRepository';
import { BaseMongoRepository } from '@shared/infra/database/mongo/BaseMongoRepository';

export default class PermissaoGrupoRepository
  extends BaseMongoRepository<IPermissaoGrupoDTO, IPermissaoGrupoDocument>
  implements IPermissaoGrupoRepository
{
  protected readonly model: Model<IPermissaoGrupoDocument> = PermissaoGrupo;
  protected readonly modelPopulated = [];

  async findByName(name: string): Promise<IPermissaoGrupoDocument | null> {
    return await this.model.findOne({ name });
  }
}
