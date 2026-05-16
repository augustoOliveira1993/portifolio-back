import { injectable, inject, container } from 'tsyringe';
import IBlocksRepository from '@modules/users/repositories/IBlocksRepository';
import ResetAttemptsService from './ResetAttemptsService';

@injectable()
export default class IsBlockedService {
  constructor(
    @inject('BlocksRepository')
    private blockRepository: IBlocksRepository,
  ) {}

  async execute(email: string): Promise<{
    blocked: boolean;
    minutesLeft: number | null;
    attempts: number | null;
  }> {
    const block = await this.blockRepository.findByEmail(email);

    if (block && block.tentativas >= 3) {
      const timeSinceLastAttempt =
        (new Date().getTime() - new Date(block.date).getTime()) / (1000 * 60);
      if (timeSinceLastAttempt < 30) {
        return {
          blocked: true,
          minutesLeft: 30 - Math.floor(timeSinceLastAttempt),
          attempts: block.tentativas,
        };
      } else {
        const resetAttemptsService = container.resolve(ResetAttemptsService);
        await resetAttemptsService.execute(email);
      }
    }

    return { blocked: false, minutesLeft: null, attempts: null };
  }
}
