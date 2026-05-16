import { injectable, inject } from 'tsyringe';
import IBlogPostRepository from '@modules/blogPost/repositories/IBlogPostRepository';
import { IBlogPostDocument } from '@modules/blogPost/dto/IBlogPostDTO';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
export default class FindBySlugService {
  constructor(
    @inject('BlogPostRepository')
    private repository: IBlogPostRepository,
  ) {}

  public async execute(slug: string): Promise<IBlogPostDocument> {
    const exist = await this.repository.findBySlug(slug);
    if (!exist) {
      throw new NotFoundError({ message: 'Post não encontrado' });
    }

    await this.repository.update(String(exist._id), { views: exist.views + 1 });

    return exist;
  }
}
