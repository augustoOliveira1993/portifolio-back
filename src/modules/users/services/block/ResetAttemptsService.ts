import { injectable, inject } from 'tsyringe';
import IBlocksRepository from '@modules/users/repositories/IBlocksRepository';

@injectable()
export default class ResetAttemptsService {
  constructor(
    @inject('BlocksRepository')
    private repository: IBlocksRepository,
  ) {}

  async execute(email: string): Promise<void> {
    const block = await this.repository.findByEmail(email);

    if (block) {
      await this.repository.findByEmailAndRemove(email);
    }
  }
}
