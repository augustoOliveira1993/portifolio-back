import { Model } from 'mongoose';
import { BlogPost } from '@modules/blogPost/infra/mongo/models/BlogPost';
import { IBlogPostDTO, IBlogPostDocument } from '@modules/blogPost/dto/IBlogPostDTO';
import IBlogPostRepository from '@modules/blogPost/repositories/IBlogPostRepository';
import { BaseMongoRepository } from '@shared/infra/database/mongo/BaseMongoRepository';

export default class BlogPostRepository
  extends BaseMongoRepository<IBlogPostDTO, IBlogPostDocument>
  implements IBlogPostRepository
{
  protected readonly model: Model<IBlogPostDocument> = BlogPost;
  protected readonly modelPopulated = [];

  async findBySlug(slug: string): Promise<IBlogPostDocument | null> {
    return this.model.findOne({ slug });
  }
}
