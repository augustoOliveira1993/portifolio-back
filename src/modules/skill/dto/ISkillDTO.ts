import { Document } from 'mongoose';


export enum ESkillLevel {
  INICIANTE = 1,
  INTERMEDIARIO = 2,
  AVANCADO = 3,
  EXPERT = 4,
}

export enum ESkillCategory {
  FRONTEND = 'frontend',
  BACKEND = 'backend',
  DATABASE = 'database',
  DEVOPS = 'devops',
  MOBILE = 'mobile',
  OUTROS = 'outros',
}

export interface ISkillDTO {
  name: string;
  category: ESkillCategory;
  level: ESkillLevel;
  iconUrl?: string;
  order: number;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface ISkillDocument extends ISkillDTO, Document {}
