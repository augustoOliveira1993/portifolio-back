import { Model, QueryOptions } from 'mongoose';
import { Role } from '@modules/users/infra/mongo/models/Role';
import { IRoleDTO, IRoleDocument } from '@modules/users/dto/IRoleDTO';
import IRoleRepository from '@modules/users/repositories/IRoleRepository';
import { BaseMongoRepository } from '@shared/infra/database/mongo/BaseMongoRepository';

class RoleRepository
  extends BaseMongoRepository<IRoleDTO, IRoleDocument>
  implements IRoleRepository
{
  protected readonly model: Model<IRoleDocument> = Role;
  protected readonly modelPopulated = [];

  async findByName(name: string): Promise<IRoleDocument | null> {
    return await this.model.findOne({ name }).exec();
  }

  async addPermissionByRoleId(
    id: string,
    permissions: string[],
  ): Promise<IRoleDocument | null> {
    return await this.model.findOneAndUpdate(
      { _id: id },
      { $addToSet: { permissions: { $each: permissions } } },
      { new: true },
    );
  }
}

export default RoleRepository;
