import { Model } from 'mongoose';
import { Block } from '@modules/users/infra/mongo/models/Block';
import { IBlockDTO, IBlockDocument } from '@modules/users/dto/IBlockDTO';
import IBlockRepository from '@modules/users/repositories/IBlocksRepository';
import { BaseMongoRepository } from '@shared/infra/database/mongo/BaseMongoRepository';

class BlockRepository
  extends BaseMongoRepository<IBlockDTO, IBlockDocument>
  implements IBlockRepository
{
  protected readonly model: Model<IBlockDocument> = Block;
  protected readonly modelPopulated = [];

  public async findByEmail(email: string): Promise<IBlockDocument | null> {
    return this.model.findOne({ email }).exec();
  }

  public async findByEmailAndRemove(
    email: string,
  ): Promise<IBlockDocument | null> {
    const document = await this.findByEmail(email);
    await this.model.deleteMany({ email }).exec();
    return document;
  }
}

export default BlockRepository;
