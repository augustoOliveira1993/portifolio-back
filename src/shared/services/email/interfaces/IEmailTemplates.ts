import { EmailTemplateEnum } from '../enums/EmailTemplateEnum';

/**
 * Interface base para dados de envio de email
 */
export interface IEmailData {
  to: string | string[];
  subject: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  replyTo?: string;
}

/**
 * Interface para envio de email com template
 */
export interface ISendTemplateEmail<T = any> extends IEmailData {
  template: EmailTemplateEnum;
  data: T;
}

/**
 * Template: Aprovação de Recrutamento
 */
export interface IAprovacaoRecrutamentoData {
  aprovadorNome?: string;
  posicao: string;
  id_seq?: number;
  solicitanteEmail?: string | null;
  justificativa?: string;
  linkAprovar: string;
  linkReprovar: string;
  expiracaoToken?: string;
}

export interface ISolicitacaoRecrutamentoSolicitanteData {
  nomeSolicitante?: string;
  solicitanteEmail?: string | null;
  posicao: string;
  id_seq?: number;
  justificativa?: string;
}

export interface IReprovacaoRecrutamentoSolicitanteData {
  nomeSolicitante?: string;
  solicitanteEmail?: string;
  posicao: string;
  id_seq?: number;
  aprovadorEmail?: string;
  observacao?: string;
}

export interface IAprovadoRecrutamentoSolicitanteData {
  nomeSolicitante?: string;
  solicitanteEmail?: string;
  posicao: string;
  id_seq?: number;
  aprovadorEmail?: string;
  observacao?: string;
}

export interface IAprovadoBacklogRhData {
  nome_gestor: string;
  id_seq?: number;
  linkSistema?: string;
}
