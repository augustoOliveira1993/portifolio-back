import { Model } from 'mongoose';
import {
  IPermissaoDTO,
  IPermissaoDocument,
} from '@modules/users/dto/IPermissaoDTO';
import IPermissaoRepository from '@modules/users/repositories/IPermissaoRepository';
import { BaseMongoRepository } from '@shared/infra/database/mongo/BaseMongoRepository';
import { Permissao } from '../models/Permissao';
import { IModelPopulated } from '@shared/types/global';

class PermissaoRepository
  extends BaseMongoRepository<IPermissaoDTO, IPermissaoDocument>
  implements IPermissaoRepository
{
  protected readonly model: Model<IPermissaoDocument> = Permissao;
  protected readonly modelPopulated: IModelPopulated[] = [
    {
      path: 'roles',
    },
    {
      path: 'permissao_grupos',
    },
  ];

  async findByName(name: string): Promise<IPermissaoDocument | null> {
    return await this.model.findOne({ name }).populate(this.modelPopulated);
  }
}

export default PermissaoRepository;
