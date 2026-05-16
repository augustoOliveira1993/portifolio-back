import { Document } from 'mongoose';

export interface IPermissaoGrupoDTO {
  name: string;
}

export interface IPermissaoGrupoDocument extends IPermissaoGrupoDTO, Document {}

export interface IResquestQuery {
  search: string | null;
}

export interface IPermissaoGrupoFindAllResponse {
  data: IPermissaoGrupoDocument[];
  total: number;
}

export interface IDataBodyAddPermissions {
  permissions: string[];
}
