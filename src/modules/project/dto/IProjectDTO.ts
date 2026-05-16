import { Document } from 'mongoose';


export enum EProjectStatus {
  EM_ANDAMENTO = 'em_andamento',
  CONCLUIDO = 'concluido',
  PAUSADO = 'pausado',
}

export interface IProjectDTO {
  title: string;
  description: string;
  longDescription?: string;
  technologies: string[];
  images?: string[];
  githubUrl?: string;
  liveUrl?: string;
  status: EProjectStatus;
  featured: boolean;
  order: number;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface IProjectDocument extends IProjectDTO, Document {}
