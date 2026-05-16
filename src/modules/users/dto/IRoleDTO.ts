import { Document } from 'mongoose';

export enum ENameRoleDefault {
  Administrador = 'Administrador',
  Usuario = 'Usuario',
}

export enum EDescrocapRoleDefault {
  Administrador = 'Administrador do sistema',
  Usuario = 'Usuário do sistema',
}

export interface IRoleDTO {
  name: string;
  description: string;
}

export interface IRoleDocument extends IRoleDTO, Document {}
