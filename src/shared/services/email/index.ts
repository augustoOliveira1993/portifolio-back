// Configuração
export { MicrosoftGraphConfig } from './config/MicrosoftGraphConfig';

// Enum de templates
export { EmailTemplateEnum } from './enums/EmailTemplateEnum';

// Interfaces
export {
  IEmailData,
  ISendTemplateEmail,
  IAprovacaoRecrutamentoData,
  ISolicitacaoRecrutamentoSolicitanteData,
  IAprovadoRecrutamentoSolicitanteData,
  IReprovacaoRecrutamentoSolicitanteData,
} from './interfaces/IEmailTemplates';

// Serviço principal
export { default as EmailService } from './EmailService';
