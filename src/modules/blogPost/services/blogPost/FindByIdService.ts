import { injectable, inject } from 'tsyringe';
import IBlogPostRepository from '@modules/blogPost/repositories/IBlogPostRepository';
import { IBlogPostDocument } from '@modules/blogPost/dto/IBlogPostDTO';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
export default class FindByIdService {
  constructor(
    @inject('BlogPostRepository')
    private repository: IBlogPostRepository,
  ) {}

  public async execute(id: string): Promise<IBlogPostDocument> {
    const exist = await this.repository.findById(id);
    if (!exist) {
      throw new NotFoundError({ message: 'Post não encontrado' });
    }
    return exist;
  }
}
