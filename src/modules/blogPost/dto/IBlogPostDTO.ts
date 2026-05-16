import { Document } from 'mongoose';


export enum EBlogStatus {
  RASCUNHO = 'rascunho',
  PUBLICADO = 'publicado',
  ARQUIVADO = 'arquivado',
}

export interface IBlogPostDTO {
  title: string;
  slug: string;
  summary: string;
  content: string;
  tags: string[];
  coverImageUrl?: string;
  status: EBlogStatus;
  views: number;
  featured: boolean;
  publishedAt?: Date;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface IBlogPostDocument extends IBlogPostDTO, Document {}
