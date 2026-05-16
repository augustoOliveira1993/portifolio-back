import { Document } from 'mongoose';

export interface IExperienceDTO {
  company: string;
  role: string;
  description: string;
  technologies: string[];
  startDate: Date;
  endDate?: Date;
  current: boolean;
  logoUrl?: string;
  order: number;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface IExperienceDocument extends IExperienceDTO, Document {}
