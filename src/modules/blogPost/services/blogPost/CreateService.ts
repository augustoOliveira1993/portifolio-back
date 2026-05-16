import { injectable, inject } from 'tsyringe';
import IBlogPostRepository from '@modules/blogPost/repositories/IBlogPostRepository';
import { IBlogPostDTO, IBlogPostDocument } from '@modules/blogPost/dto/IBlogPostDTO';
import { IServiceResponse } from '@shared/types/global';

@injectable()
export default class CreateService {
  constructor(
    @inject('BlogPostRepository')
    private repository: IBlogPostRepository,
  ) {}

  public async execute(
    data: IBlogPostDTO,
    userEmail: string | undefined,
  ): Promise<IServiceResponse<IBlogPostDocument>> {
    const payload = { ...data, created_by: userEmail };
    if (payload.status === 'publicado' && !payload.publishedAt) {
      payload.publishedAt = new Date();
    }

    const created = await this.repository.create(payload);

    return {
      success: true,
      message: 'Post criado com sucesso!',
      data: created,
    };
  }
}
