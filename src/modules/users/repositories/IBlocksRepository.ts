import { IBlockDTO, IBlockDocument } from '@modules/users/dto/IBlockDTO';
import IBaseRepository from '@shared/infra/database/mongo/IBaseRepository';

export default interface IBlockRepository extends IBaseRepository<
  IBlockDTO,
  IBlockDocument
> {
  findByEmail(email: string): Promise<IBlockDocument | null>;
  findByEmailAndRemove(email: string): Promise<IBlockDocument | null>;
}
