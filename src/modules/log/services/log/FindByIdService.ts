import { injectable, inject } from 'tsyringe';
import ILogRepository from '../../repositories/ILogRepository';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
class CreateService {
  constructor(
    @inject('LogRepository')
    private repository: ILogRepository,
  ) {}

  public async execute(id: string) {
    const roleExist = await this.repository.findById(id);
    if (!roleExist) {
      throw new NotFoundError({ message: 'Log não encontrada' });
    }
    return roleExist;
  }
}

export default CreateService;
