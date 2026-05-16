import { injectable, inject } from 'tsyringe';
import IBlogPostRepository from '@modules/blogPost/repositories/IBlogPostRepository';
import { IBlogPostDTO, IBlogPostDocument } from '@modules/blogPost/dto/IBlogPostDTO';
import { IServiceResponse } from '@shared/types/global';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
export default class UpdateService {
  constructor(
    @inject('BlogPostRepository')
    private repository: IBlogPostRepository,
  ) {}

  public async execute(
    id: string,
    data: Partial<IBlogPostDTO>,
    userEmail: string | undefined,
  ): Promise<IServiceResponse<IBlogPostDocument>> {
    const exist = await this.repository.findById(id);
    if (!exist) {
      throw new NotFoundError({ message: 'Post não encontrado' });
    }

    const payload = { ...data, updated_by: userEmail };
    if (payload.status === 'publicado' && !payload.publishedAt && !exist.publishedAt) {
      payload.publishedAt = new Date();
    }

    const updated = await this.repository.update(id, payload);

    return {
      success: true,
      message: 'Post atualizado com sucesso!',
      data: updated!,
    };
  }
}
