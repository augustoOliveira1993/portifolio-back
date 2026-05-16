import { Document } from 'mongoose';

// Tipos possíveis para ações
type ActionType = 'button' | 'link';
type ActionStyle = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark' | 'link' | string;

// Tipos comuns de notificação (pode ser estendido conforme necessário)
type NotificationType =
  | 'alert'
  | 'error'
  | 'success'
  | 'warning'
  | 'info'

export interface INotificationAction {
  type: ActionType;
  label: string;
  action?: string; // identificador da ação no frontend
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload?: Record<string, any>;
  style?: ActionStyle;
}

export interface INotificationDTO {
  user?: string;
  title?: string;
  message?: string;
  type?: NotificationType;
  is_read?: boolean;
  expiresAt?: Date;
  metadata?: any;
  actions?: INotificationAction[];

  updated_by?: string;
  created_by?: string;
}

export interface INotificationDocument extends INotificationDTO, Document {}
