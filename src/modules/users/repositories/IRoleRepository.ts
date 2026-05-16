import { IRoleDTO, IRoleDocument } from '@modules/users/dto/IRoleDTO';
import IBaseRepository from '@shared/infra/database/mongo/IBaseRepository';

export default interface IRoleRepository extends IBaseRepository<
  IRoleDTO,
  IRoleDocument
> {
  findByName(name: string): Promise<IRoleDocument | null>;
  addPermissionByRoleId(
    id: string,
    permission: string[],
  ): Promise<IRoleDocument | null>;
}
