import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

const isProd = process.env.NODE_ENV === 'production';

/** Limiter global: 200 req/min por IP */
export const globalRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: isProd ? 200 : 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      title: 'Muitas requisições',
      message:
        'Você excedeu o limite de requisições. Tente novamente em breve.',
    });
  },
});

/** Limiter para rotas de autenticação: 10 tentativas/min por IP */
export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      title: 'Muitas tentativas',
      message: 'Muitas tentativas de login. Aguarde 1 minuto.',
    });
  },
});
