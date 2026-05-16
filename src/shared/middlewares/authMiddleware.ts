import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '@configs/auth/jwt.config';
import { parseExpirationTime } from '@configs/auth/jwt.config';
import { UnauthorizedError } from '@shared/errors/AppError';
import { container } from 'tsyringe';
import ISessionRepository from '@modules/session/repositories/ISessionRepository';
import SessionLogService from '@modules/session/services/session/SessionLogService';
import { logger } from '@shared/utils/logger';
import { getClientInfo } from '@shared/utils/request';

interface ITokenPayload {
  id: string;
  email: string;
  role: string;
  is_admin: boolean;
  estrutura_rm?: string;
  expire_at?: string;
  sessionId: string; // Agora obrigatório - todos os novos tokens têm sessão
  iat?: number;
  exp?: number;
}

// Cache de última atividade para debounce (evita writes excessivos no Redis)
const lastActivityCache = new Map<string, number>();
const ACTIVITY_UPDATE_INTERVAL = 60000; // 1 minuto em milissegundos

export const verifyToken = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  const token =
    (req.headers['x-access-token'] as string) ||
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : undefined);

  if (!token) {
    throw new UnauthorizedError({
      message: 'Nenhum token fornecido',
      title: 'Falha na autenticação!',
    });
  }

  if (!config.secret) {
    throw new UnauthorizedError({
      message: 'Token chave de autenticação não definida',
      title: 'Falha na autenticação!',
    });
  }

  try {
    const decoded = jwt.verify(token, config.secret) as ITokenPayload;

    req.userId = decoded.id;
    req.userEmail = decoded.email;
    req.is_admin = decoded.is_admin;
    req.estrutura_rm = decoded.estrutura_rm;
    req.sessionId = decoded.sessionId;

    // === INÍCIO: Validação de Sessão (OBRIGATÓRIA) ===
    // Todos os tokens agora devem ter sessionId
    if (!decoded.sessionId) {
      logger.warn(
        `Token sem sessionId detectado para usuário ${decoded.email}. Faça login novamente.`,
      );
      throw new UnauthorizedError({
        message:
          'Token desatualizado. Por favor, faça login novamente para criar uma nova sessão.',
        title: 'Sessão Inválida',
      });
    }

    try {
      const sessionRepository =
        container.resolve<ISessionRepository>('SessionRepository');
      const isActive = await sessionRepository.isActive(decoded.sessionId);

      if (!isActive) {
        // Log de acesso negado
        const sessionLogService = container.resolve(SessionLogService);
        const { ip, userAgent } = getClientInfo(req);

        await sessionLogService.logAccessDenied({
          email: decoded.email,
          ip,
          userAgent,
          reason: 'Sessão expirada ou encerrada',
          endpoint: req.originalUrl,
        });

        throw new UnauthorizedError({
          message: 'Sessão expirada ou encerrada. Faça login novamente.',
          title: 'Sessão Inválida',
        });
      }

      // Atualiza lastActivityAt com debounce (máximo 1x por minuto)
      const cacheKey = decoded.sessionId;
      const lastUpdate = lastActivityCache.get(cacheKey) || 0;
      const now = Date.now();

      if (now - lastUpdate >= ACTIVITY_UPDATE_INTERVAL) {
        // Calcula novo expiresAt baseado no tempo de expiração do token
        const sessionTtlMs = parseExpirationTime(
          decoded.expire_at || '8h',
          'milliseconds',
        );
        const newExpiresAt = new Date(now + sessionTtlMs);

        // Atualiza de forma assíncrona (não bloqueia a requisição)
        setImmediate(async () => {
          try {
            await sessionRepository.updateLastActivity({
              sessionId: decoded.sessionId,
              lastActivityAt: new Date(),
              expiresAt: newExpiresAt,
            });
            lastActivityCache.set(cacheKey, now);

            // Limpa cache antigo (evita memory leak)
            if (lastActivityCache.size > 10000) {
              const entries = Array.from(lastActivityCache.entries());
              const oldEntries = entries
                .filter(
                  ([_, timestamp]) =>
                    now - timestamp > ACTIVITY_UPDATE_INTERVAL * 10,
                )
                .map(([key]) => key);
              oldEntries.forEach(key => lastActivityCache.delete(key));
            }
          } catch (error) {
            logger.error(`Erro ao atualizar lastActivityAt: ${error}`);
          }
        });
      }
    } catch (error) {
      // Se erro for de autenticação, propaga
      if (error instanceof UnauthorizedError) {
        throw error;
      }
      // Outros erros (Redis down, etc) - BLOQUEIA acesso
      logger.error(
        `Erro crítico ao validar sessão no Redis: ${error}. Acesso negado.`,
      );
      throw new UnauthorizedError({
        message:
          'Sistema de sessões temporariamente indisponível. Tente novamente.',
        title: 'Erro de Sessão',
      });
    }
    // === FIM: Validação de Sessão ===

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError({
      message: 'Token inválido ou expirado',
      title: 'Falha na autenticação!',
    });
  }
};

export const generateToken = (
  payload: Omit<ITokenPayload, 'iat' | 'exp'>,
  noExpiration: boolean = false,
): string => {
  if (!config.secret) {
    throw new UnauthorizedError({
      message: 'Token chave de autenticação não definida',
      title: 'Falha na autenticação!',
    });
  }

  const options: jwt.SignOptions = noExpiration
    ? {}
    : { expiresIn: payload.expire_at as jwt.SignOptions['expiresIn'] };

  return jwt.sign(payload, config.secret, options);
};

export const generateRefreshToken = (
  payload: Omit<ITokenPayload, 'iat' | 'exp'>,
  noExpiration: boolean = false,
): string => {
  if (!config.refreshSecret) {
    throw new UnauthorizedError({
      message: 'Refresh token chave de autenticação não definida',
      title: 'Falha na autenticação!',
    });
  }

  const options: jwt.SignOptions = noExpiration
    ? {}
    : {
      expiresIn: payload?.expire_at
        ? `${Number(payload.expire_at.slice(0, -1)) + 1}${payload.expire_at.slice(-1)}`
        : config.expiresInRefreshToken,
    };

  return jwt.sign(payload, config.refreshSecret, options);
};
