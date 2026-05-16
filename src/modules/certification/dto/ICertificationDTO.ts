import { Document } from 'mongoose';

export interface ICertificationDTO {
  name: string;
  issuer: string;
  issueDate: Date;
  expirationDate?: Date;
  credentialId?: string;
  credentialUrl?: string;
  imageUrl?: string;
  order: number;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface ICertificationDocument extends ICertificationDTO, Document {}
