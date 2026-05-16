import { IUserDTO, IUserDocument } from '@modules/users/dto/IUserDTO';
import IBaseRepository from '@shared/infra/database/mongo/IBaseRepository';

export default interface IUsersRepository extends IBaseRepository<
  IUserDTO,
  IUserDocument
> {
  findByEmail(email: string): Promise<IUserDocument | null>;
  addPermissionByUserId(
    id: string,
    permission: string[],
  ): Promise<IUserDocument | null>;
  removePermissionByUserId(
    id: string,
    permission: string[],
  ): Promise<IUserDocument | null>;
  updateManyUsersWithRole(
    roleName: string,
    idRole: string,
  ): Promise<IUserDocument[]>;
  getAbilitiesUser(email: string): Promise<IUserDocument | null>;
  isAdmin(email: string): Promise<boolean | undefined>;
}
