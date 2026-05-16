import { injectable, inject } from 'tsyringe';
import IBlogPostRepository from '@modules/blogPost/repositories/IBlogPostRepository';
import { IServiceResponse } from '@shared/types/global';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
export default class DeleteService {
  constructor(
    @inject('BlogPostRepository')
    private repository: IBlogPostRepository,
  ) {}

  public async execute(id: string): Promise<IServiceResponse<{ id: string }>> {
    const deleted = await this.repository.delete(id);
    if (!deleted) {
      throw new NotFoundError({ message: 'Post não encontrado' });
    }

    return {
      success: true,
      message: 'Post deletado com sucesso!',
      data: { id: deleted.id },
    };
  }
}
