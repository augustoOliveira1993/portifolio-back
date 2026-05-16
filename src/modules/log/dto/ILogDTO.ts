import { Document } from 'mongoose';

/**
 * Enum de categorias de log
 */
export enum LogCategory {
  AUDIT = 'AUDIT',
  SESSION_LOG = 'SESSION_LOG',
  SYSTEM = 'SYSTEM',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
}

export enum EMethodLog {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

/**
 * Enum de ações de log
 */
export enum LogAction {
  // Ações de CRUD
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  READ = 'READ',

  // Ações de Sessão
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  ACCESS_DENIED = 'ACCESS_DENIED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',

  // Outras ações
  UNKNOWN = 'UNKNOWN',
}

export interface ILogDTO {
  action: LogAction | string;
  category: LogCategory | string;
  message?: string;
  created_by?: string | null;
  updated_by?: string | null;
  // Campos de auditoria
  ip?: string;
  userAgent?: string;
  sessionId?: string;
  endpoint?: string;
  statusCode?: number;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  metadata?: any;
  diff?: any;
}

export interface ILogDocument extends ILogDTO, Document {}

export interface IResquestQuery {
  search: string | null;
}

export interface ILogFindAllResponse {
  documents: ILogDocument[];
  total: number;
}
