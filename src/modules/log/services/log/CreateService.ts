import { injectable, inject } from 'tsyringe';
import { ILogDocument } from '../../dto/ILogDTO';
import ILogRepository from '../../repositories/ILogRepository';

@injectable()
class CreateService {
  constructor(
    @inject('LogRepository')
    private repository: ILogRepository,
  ) {}

  public async execute(data: ILogDocument, userEmail: string | undefined) {
    const created = await this.repository.create({
      ...data,
      created_by: userEmail,
    });
    return {
      success: true,
      message: 'Log criada com sucesso!',
      data: created,
    };
  }
}

export default CreateService;
