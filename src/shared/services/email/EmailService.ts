import { injectable } from 'tsyringe';
import { logger } from '@shared/utils/logger';
import { MicrosoftGraphConfig } from './config/MicrosoftGraphConfig';
import { EmailTemplateEnum } from './enums/EmailTemplateEnum';
import {
  IAprovadoRecrutamentoSolicitanteData,
  IAprovacaoRecrutamentoData,
  IEmailData,
  IReprovacaoRecrutamentoSolicitanteData,
  ISolicitacaoRecrutamentoSolicitanteData,
  ISendTemplateEmail,
  IAprovadoBacklogRhData,
} from './interfaces/IEmailTemplates';

import { confirmacaoSolicitante } from './templates/recrutamento/confirmacaoSolicitante';
import { reprovacaoSolicitante } from './templates/recrutamento/reprovacaoSolicitante';

import { aprovadoSolicitante } from './templates/recrutamento/aprovadoSolicitante';
import { aprovacaoDiretor } from './templates/recrutamento/aprovacaoDiretor';
import { aprovadoBacklogRh } from './templates/recrutamento/aprovacaoBacklogRh';

const DEFAULT_CC_RECIPIENTS = ['recrutamento.rh@ferroeste.com.br'];

interface IEmailServiceConfig {
  from: string;
  defaultCc: string[];
  tenantId?: string;
  clientId?: string;
  clientSecret?: string;
}

@injectable()
export default class EmailService {
  private config: IEmailServiceConfig;

  private mergeCcRecipients(
    cc?: string | string[],
  ): Array<{ emailAddress: { address: string } }> | undefined {
    const providedCc = cc ? (Array.isArray(cc) ? cc : [cc]) : [];
    const merged = [...providedCc, ...this.config.defaultCc]
      .map(email => email.trim())
      .filter(Boolean);

    const uniqueCc = [...new Set(merged)];

    if (uniqueCc.length === 0) {
      return undefined;
    }

    return this.formatRecipients(uniqueCc);
  }

  constructor() {
    this.config = {
      from: process.env.MAIL_FROM_USER || 'recrutamento.rh@ferroeste.com.br',
      defaultCc: DEFAULT_CC_RECIPIENTS,
      tenantId: process.env.AZURE_TENANT_ID,
      clientId: process.env.AZURE_CLIENT_ID,
      clientSecret: process.env.AZURE_CLIENT_SECRET,
    };

    this.initialize();
  }

  /**
   * Inicializa o cliente do Microsoft Graph
   */
  private initialize(): void {
    if (
      !this.config.tenantId ||
      !this.config.clientId ||
      !this.config.clientSecret
    ) {
      logger.warn(
        '[EmailService] Microsoft Graph não configurado. Emails não serão enviados.',
      );
      return;
    }

    try {
      MicrosoftGraphConfig.initialize();
      logger.info('[EmailService] Microsoft Graph inicializado com sucesso');
    } catch (error) {
      logger.error('[EmailService] Erro ao inicializar Microsoft Graph', {
        error,
      });
    }
  }

  /**
   * Verifica se o serviço de email está configurado
   */
  public isConfigured(): boolean {
    return MicrosoftGraphConfig.isConfigured();
  }

  /**
   * Obtém o template HTML baseado no enum
   */
  private getTemplate(template: EmailTemplateEnum, data: any): string | null {
    switch (template) {
      case EmailTemplateEnum.APROVACAO_DIRETOR:
        return aprovacaoDiretor(data as IAprovacaoRecrutamentoData);

      case EmailTemplateEnum.CONFIRMACAO_SOLICITANTE:
        return confirmacaoSolicitante(
          data as ISolicitacaoRecrutamentoSolicitanteData,
        );

      case EmailTemplateEnum.REPROVACAO_SOLICITANTE:
        return reprovacaoSolicitante(
          data as IReprovacaoRecrutamentoSolicitanteData,
        );

      case EmailTemplateEnum.APROVADO_SOLICITANTE:
        return aprovadoSolicitante(
          data as IAprovadoRecrutamentoSolicitanteData,
        );

      case EmailTemplateEnum.APROVADO_BACKLOG_RH:
        return aprovadoBacklogRh(data as IAprovadoBacklogRhData);

      default:
        logger.error(`[EmailService] Template não encontrado: ${template}`);
        return null;
    }
  }

  /**
   * Converte destinatários para formato do Microsoft Graph
   */
  private formatRecipients(
    recipients: string | string[],
  ): Array<{ emailAddress: { address: string } }> {
    const emails = Array.isArray(recipients) ? recipients : [recipients];
    return emails.map(email => ({
      emailAddress: { address: email },
    }));
  }

  /**
   * Envia email usando um template
   */
  public async sendTemplateEmail<T = any>(
    emailData: ISendTemplateEmail<T>,
  ): Promise<{ sent: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured()) {
      logger.warn(
        '[EmailService] Microsoft Graph não configurado. Email não enviado.',
      );
      return {
        sent: false,
        error: 'Microsoft Graph não configurado',
      };
    }

    try {
      const html = this.getTemplate(emailData.template, emailData.data);

      if (!html) {
        return {
          sent: false,
          error: 'Template não encontrado',
        };
      }

      const client = MicrosoftGraphConfig.getClient();

      if (!client) {
        return {
          sent: false,
          error: 'Cliente Microsoft Graph não disponível',
        };
      }

      // Monta o objeto de mensagem no formato do Microsoft Graph
      const message: any = {
        message: {
          subject: emailData.subject,
          body: {
            contentType: 'HTML',
            content: html,
          },
          toRecipients: this.formatRecipients(emailData.to),
          from: {
            emailAddress: {
              address: emailData.from || this.config.from,
            },
          },
        },
        saveToSentItems: true,
      };

      // Adiciona CC (inclui lista fixa padrão)
      const ccRecipients = this.mergeCcRecipients(emailData.cc);
      if (ccRecipients) {
        message.message.ccRecipients = ccRecipients;
      }

      // Adiciona BCC se fornecido
      if (emailData.bcc) {
        message.message.bccRecipients = this.formatRecipients(emailData.bcc);
      }

      // Adiciona replyTo se fornecido
      if (emailData.replyTo) {
        message.message.replyTo = this.formatRecipients(emailData.replyTo);
      }

      // Envia o email usando o Microsoft Graph
      const fromUser = emailData.from || this.config.from;
      await client.api(`/users/${fromUser}/sendMail`).post(message);

      logger.info('[EmailService] Email enviado com sucesso', {
        to: emailData.to,
        subject: emailData.subject,
        template: emailData.template,
        from: fromUser,
      });

      return {
        sent: true,
        messageId: `sent-${Date.now()}`,
      };
    } catch (error) {
      logger.error(
        `[EmailService] Erro ao enviar email, ${JSON.stringify(
          {
            error,
            to: emailData.to,
            template: emailData.template,
          },
          null,
          2,
        )}`,
      );

      return {
        sent: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Envia email simples (sem template)
   */
  public async sendSimpleEmail(
    emailData: IEmailData & { html?: string; text?: string },
  ): Promise<{ sent: boolean; messageId?: string; error?: string }> {
    if (!this.isConfigured()) {
      logger.warn(
        '[EmailService] Microsoft Graph não configurado. Email não enviado.',
      );
      return {
        sent: false,
        error: 'Microsoft Graph não configurado',
      };
    }

    try {
      const client = MicrosoftGraphConfig.getClient();

      if (!client) {
        return {
          sent: false,
          error: 'Cliente Microsoft Graph não disponível',
        };
      }

      // Monta o objeto de mensagem no formato do Microsoft Graph
      const message: any = {
        message: {
          subject: emailData.subject,
          body: {
            contentType: emailData.html ? 'HTML' : 'Text',
            content: emailData.html || emailData.text || '',
          },
          toRecipients: this.formatRecipients(emailData.to),
          from: {
            emailAddress: {
              address: emailData.from || this.config.from,
            },
          },
        },
        saveToSentItems: true,
      };

      // Adiciona CC (inclui lista fixa padrão)
      const ccRecipients = this.mergeCcRecipients(emailData.cc);
      if (ccRecipients) {
        message.message.ccRecipients = ccRecipients;
      }

      // Adiciona BCC se fornecido
      if (emailData.bcc) {
        message.message.bccRecipients = this.formatRecipients(emailData.bcc);
      }

      // Adiciona replyTo se fornecido
      if (emailData.replyTo) {
        message.message.replyTo = this.formatRecipients(emailData.replyTo);
      }

      // Envia o email usando o Microsoft Graph
      const fromUser = emailData.from || this.config.from;
      await client.api(`/users/${fromUser}/sendMail`).post(message);

      logger.info('[EmailService] Email simples enviado com sucesso', {
        to: emailData.to,
        subject: emailData.subject,
        from: fromUser,
      });

      return {
        sent: true,
        messageId: `sent-${Date.now()}`,
      };
    } catch (error) {
      logger.error(
        `[EmailService] Erro ao enviar email simples, ${JSON.stringify(
          {
            error,
            to: emailData.to,
          },
          null,
          2,
        )}`,
      );

      return {
        sent: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Envia múltiplos emails (em lote)
   */
  public async sendBatchEmails(emails: ISendTemplateEmail[]): Promise<{
    sent: number;
    failed: number;
    results: Array<{ sent: boolean; to: string; error?: string }>;
  }> {
    const results = [];
    let sent = 0;
    let failed = 0;

    for (const email of emails) {
      const result = await this.sendTemplateEmail(email);

      if (result.sent) {
        sent++;
      } else {
        failed++;
      }

      results.push({
        sent: result.sent,
        to: Array.isArray(email.to) ? email.to.join(', ') : email.to,
        error: result.error,
      });
    }

    logger.info('[EmailService] Envio em lote concluído', {
      total: emails.length,
      sent,
      failed,
    });

    return { sent, failed, results };
  }

  /**
   * Verifica a conexão com Microsoft Graph
   */
  public async verifyConnection(): Promise<boolean> {
    if (!this.isConfigured()) {
      return false;
    }

    try {
      const result = await MicrosoftGraphConfig.testConnection();
      if (result) {
        logger.info(
          '[EmailService] Conexão Microsoft Graph verificada com sucesso',
        );
      }
      return result;
    } catch (error) {
      logger.error('[EmailService] Erro ao verificar conexão Microsoft Graph', {
        error,
      });
      return false;
    }
  }
}
