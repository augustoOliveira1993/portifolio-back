import mongoose, { Model, Document, QueryOptions } from 'mongoose';
import { User } from '@modules/users/infra/mongo/models/User';
import { IUserDTO, IUserDocument } from '@modules/users/dto/IUserDTO';
import IUsersRepository from '@modules/users/repositories/IUsersRepository';
import { BaseMongoRepository } from '@shared/infra/database/mongo/BaseMongoRepository';
import { ENameRoleDefault } from '@modules/users/dto/IRoleDTO';

class UserRepository
  extends BaseMongoRepository<IUserDTO, IUserDocument>
  implements IUsersRepository
{
  protected readonly model: Model<IUserDocument> = User;
  protected readonly modelPopulated = [
    {
      path: 'role',
      select: '-__v',
    },
    {
      path: 'permissaos',
      select: '-__v',
    },
  ];

  public async findByEmail(email: string): Promise<IUserDocument | null> {
    const user = this.model.findOne({ email }).populate(this.modelPopulated);
    return user;
  }

  public async addPermissionByUserId(
    id: string,
    permissions: string[],
  ): Promise<IUserDocument | null> {
    return await this.model
      .findByIdAndUpdate(
        { _id: id },
        { $addToSet: { permissaos: { $each: permissions } } },
        { new: true },
      )
      .populate(this.modelPopulated);
  }

  public async removePermissionByUserId(
    id: string,
    permissions: string[],
  ): Promise<IUserDocument | null> {
    return await this.model
      .findByIdAndUpdate(
        { _id: id },
        { $pull: { permissaos: { $in: permissions } } }, // Remove os elementos que estão no array de permissões
        { new: true },
      )
      .populate(this.modelPopulated);
  }

  public async updateManyUsersWithRole(
    roleName: string,
    idRole: string,
  ): Promise<IUserDocument[]> {
    await this.model.updateMany(
      { role: roleName },
      { $set: { role: new mongoose.Types.ObjectId(idRole) } },
    );
    return await this.model.find({ role: idRole });
  }

  public async delete(id: string): Promise<IUserDocument | null> {
    return await this.model.findByIdAndDelete(id);
  }

  public async getAbilitiesUser(email: string): Promise<any | null> {
    const user = await this.model
      .findOne({
        email,
      })
      .populate(this.modelPopulated);
    return user?.permissaos?.map((p: any) => p?.name as string) || [];
  }

  async isAdmin(email: string): Promise<boolean | undefined> {
    const user = await this.model
      .findOne({ email })
      .populate(this.modelPopulated);
    return (user?.role as any)?.name === ENameRoleDefault.Administrador;
  }
}

export default UserRepository;
