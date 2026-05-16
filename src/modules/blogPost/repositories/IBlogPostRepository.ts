import { IBlogPostDTO, IBlogPostDocument } from '@modules/blogPost/dto/IBlogPostDTO';
import IBaseRepository from '@shared/infra/database/mongo/IBaseRepository';

export default interface IBlogPostRepository
  extends IBaseRepository<IBlogPostDTO, IBlogPostDocument> {
  findBySlug(slug: string): Promise<IBlogPostDocument | null>;
}
