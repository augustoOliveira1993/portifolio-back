import { Document } from 'mongoose';

export interface IBlockDTO {
  tipo: string;
  email: string;
  date: Date;
  tentativas: number;
}

export interface IBlockDocument extends IBlockDTO, Document {}
