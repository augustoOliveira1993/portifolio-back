import { Document } from 'mongoose';
import { IRoleDTO } from './IRoleDTO';

export interface IUserDTO {
  username: string;
  email: string;
  password?: string;
  role?: string | IRoleDTO;
  permissaos?: string[];
  avatar_url?: string;
  pagina_inicial?: string;
  status?: string;
  tempo_expiracao_token?: string;
}

export interface IUserDocument extends IUserDTO, Document {}

export interface IDataBodyAddPermissions {
  permissaos: string[];
}

export interface IResquestQuery {
  search: string | null;
}

export interface IFindAllResponse {
  data: IUserDTO[];
  total: number;
}
