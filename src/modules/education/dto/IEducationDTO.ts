import { Document } from 'mongoose';

export interface IEducationDTO {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  current: boolean;
  logoUrl?: string;
  order: number;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface IEducationDocument extends IEducationDTO, Document {}
