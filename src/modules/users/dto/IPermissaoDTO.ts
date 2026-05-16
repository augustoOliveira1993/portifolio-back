import { Document } from 'mongoose';

export interface IPermissaoDTO {
  name?: string;
  roles?: string[];
  permissao_grupos?: string[];
}

export interface IPermissaoDocument extends IPermissaoDTO, Document {}

export interface IResquestQuery {
  search: string | null;
}

export interface IPermissaoFindAllResponse {
  data: IPermissaoDocument[];
  total: number;
}

export interface IDataBodyAddPermissions {
  permissions: string[];
}
