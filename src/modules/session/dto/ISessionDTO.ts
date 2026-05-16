export interface ILocationDTO {
  country?: string;
  region?: string;
  city?: string;
  lat?: number;
  lon?: number;
  timezone?: string;
}

export interface ISessionDTO {
  sessionId: string;
  userId: string;
  email: string;
  ip: string;
  userAgent: string;
  location?: ILocationDTO;
  createdAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

export interface ICreateSessionDTO {
  userId: string;
  email: string;
  ip: string;
  userAgent: string;
  location?: ILocationDTO;
  expiresIn: number; // em milissegundos
}

export interface IUpdateSessionActivityDTO {
  sessionId: string;
  lastActivityAt: Date;
  expiresAt?: Date;
}
