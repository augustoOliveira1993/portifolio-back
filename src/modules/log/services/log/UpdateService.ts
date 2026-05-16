import { injectable, inject } from 'tsyringe';
import { ILogDTO } from '../../dto/ILogDTO';
import ILogRepository from '../../repositories/ILogRepository';
import { NotFoundError } from '@shared/errors/AppError';

@injectable()
export default class UpdateService {
  constructor(
    @inject('LogRepository')
    private repository: ILogRepository,
  ) {}

  public async execute(
    idLog: string,
    data: ILogDTO,
    userEmail: string | undefined,
  ) {
    const roleExist = await this.repository.findById(idLog);
    if (!roleExist) {
      throw new NotFoundError({ message: 'Log não encontrada' });
    }
    const updateLog = await this.repository.update(idLog, {
      ...data,
      updated_by: userEmail,
    });
    return updateLog;
  }
}
