import { injectable, inject } from 'tsyringe';
import { IBlockDTO } from '@modules/users/dto/IBlockDTO';
import IBlocksRepository from '@modules/users/repositories/IBlocksRepository';
import moment from 'moment-timezone';

@injectable()
export default class RecordAttemptService {
  constructor(
    @inject('BlocksRepository')
    private blockRepository: IBlocksRepository,
  ) {}

  async execute(email: string) {
    let block = await this.blockRepository.findOne({
      email,
      tipo: 'Login',
    });

    if (!block) {
      const blockData = {
        email,
        tipo: 'Login',
        tentativas: 1,
        date: moment().tz('America/Sao_Paulo').toDate(),
      };
      await this.blockRepository.create(blockData);
      return {
        message:
          'Primeira tentativa de login falhou. Atenção, após 3 tentativas o usuário será bloqueado por 30 minutos.',
      };
    }

    let blockedUpdated = {};
    const timeSinceLastAttempt =
      moment().diff(moment(block.date), 'minutes', true) || 0;
    if (block.tentativas >= 3 && timeSinceLastAttempt >= 30) {
      blockedUpdated = {
        tentativas: 1,
        date: moment().tz('America/Sao_Paulo').toDate(),
      };
    } else {
      blockedUpdated = {
        tentativas: block.tentativas + 1,
        date: moment().tz('America/Sao_Paulo').toDate(),
      };
    }
    await this.blockRepository.update(block?._id?.toString(), blockedUpdated);
    return {
      message:
        'Tentativa de login falhou. Atenção, após 3 tentativas o usuário será bloqueado por 30 minutos.',
    };
  }
}
