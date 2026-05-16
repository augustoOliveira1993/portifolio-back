import { Document } from 'mongoose';


export enum EContactStatus {
  NOVO = 'novo',
  LIDO = 'lido',
  RESPONDIDO = 'respondido',
}

export interface IContactDTO {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: EContactStatus;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface IContactDocument extends IContactDTO, Document {}
