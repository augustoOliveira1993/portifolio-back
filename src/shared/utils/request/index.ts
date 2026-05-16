import { Request } from 'express';

export interface IRequestClientInfo {
  ip: string;
  userAgent: string;
}

export function getClientInfo(req: Request): IRequestClientInfo {
  const ipRequest =
    req.ip?.split(':').length === 3 ? 'local' : req.ip?.split(':')[3];

  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    (req.headers['x-real-ip'] as string) ||
    req.socket.remoteAddress ||
    ipRequest ||
    'IP não disponível';

  const userAgent = req.headers['user-agent'] || 'User-Agent não disponível';

  return { ip, userAgent };
}
