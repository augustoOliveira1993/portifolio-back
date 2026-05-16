import { injectable } from 'tsyringe';
import EmailService from '@shared/services/email/EmailService';
import { EmailTemplateEnum } from '@shared/services/email/enums/EmailTemplateEnum';
import { IAprovacaoRecrutamentoData } from '@shared/services/email/interfaces/IEmailTemplates';

/**
 * EXEMPLOS DE USO DO MÓDULO DE EMAIL
 *
 * Esta classe demonstra como usar o EmailService com diferentes templates.
 * Você pode copiar estes exemplos para seus próprios serviços.
 */

@injectable()
export default class EmailExamplesService {
  constructor(private emailService: EmailService) {}

  /**
   * Exemplo 1: Enviar email de aprovação de recrutamento
   */
  async enviarEmailAprovacaoRecrutamento() {
    const data: IAprovacaoRecrutamentoData = {
      aprovadorNome: 'João Silva',
      posicao: 'Desenvolvedor Sênior',
      solicitanteEmail: 'maria@empresa.com',
      linkAprovar: 'https://sistema.com/aprovar?token=abc123',
      linkReprovar: 'https://sistema.com/reprovar?token=abc123',
      expiracaoToken: '24h',
    };

    const result = await this.emailService.sendTemplateEmail({
      to: 'joao@empresa.com',
      subject: 'Aprovação de Solicitação de Recrutamento #12345',
      template: EmailTemplateEnum.APROVACAO_DIRETOR,
      data,
    });

    return result;
  }
}
