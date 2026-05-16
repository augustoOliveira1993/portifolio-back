import RedisClient from '@configs/redis.config';
import { logger } from '@shared/utils/logger';
import { v4 as uuidv4 } from 'uuid';
import {
  ICreateSessionDTO,
  ISessionDTO,
  IUpdateSessionActivityDTO,
} from '../../dto/ISessionDTO';
import ISessionRepository from '../ISessionRepository';

export default class SessionRedisRepository implements ISessionRepository {
  private redisClient = RedisClient.getInstance();
  private readonly SESSION_PREFIX = 'SESSION:USER';
  private readonly USER_SESSIONS_PREFIX = 'USER:SESSIONS';

  /**
   * Gera chave Redis para uma sessão específica
   */
  private getSessionKey(userId: string, sessionId: string): string {
    return `${this.SESSION_PREFIX}:${userId}:${sessionId}`;
  }

  /**
   * Gera chave Redis para o set de sessões de um usuário
   */
  private getUserSessionsKey(userId: string): string {
    return `${this.USER_SESSIONS_PREFIX}:${userId}`;
  }

  /**
   * Converte TTL em milissegundos para segundos (Redis usa segundos)
   */
  private getTtlInSeconds(expiresIn: number): number {
    return Math.floor(expiresIn / 1000);
  }

  async create(data: ICreateSessionDTO): Promise<ISessionDTO> {
    const sessionId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + data.expiresIn);

    const session: ISessionDTO = {
      sessionId,
      userId: data.userId,
      email: data.email,
      ip: data.ip,
      userAgent: data.userAgent,
      location: data.location,
      createdAt: now,
      lastActivityAt: now,
      expiresAt,
      isActive: true,
    };

    const sessionKey = this.getSessionKey(data.userId, sessionId);
    const userSessionsKey = this.getUserSessionsKey(data.userId);
    const ttl = this.getTtlInSeconds(data.expiresIn);

    try {
      // Armazena a sessão como hash no Redis
      await this.redisClient.hset(
        sessionKey,
        'sessionId',
        sessionId,
        'userId',
        data.userId,
        'email',
        data.email,
        'ip',
        data.ip,
        'userAgent',
        data.userAgent,
        'location',
        JSON.stringify(data.location || {}),
        'createdAt',
        now.toISOString(),
        'lastActivityAt',
        now.toISOString(),
        'expiresAt',
        expiresAt.toISOString(),
        'isActive',
        'true',
      );

      // Define TTL da sessão
      await this.redisClient.expire(sessionKey, ttl);

      // Adiciona sessionId ao set de sessões do usuário
      await this.redisClient.sadd(userSessionsKey, sessionId);
      await this.redisClient.expire(userSessionsKey, ttl);

      logger.info(`Sessão criada: ${sessionId} para usuário ${data.userId}`);

      return session;
    } catch (error) {
      logger.error(`Erro ao criar sessão: ${error}`);
      throw error;
    }
  }

  async findById(sessionId: string): Promise<ISessionDTO | null> {
    try {
      // Busca todas as chaves de sessão que contêm este sessionId
      const pattern = `${this.SESSION_PREFIX}:*:${sessionId}`;
      const keys = await this.redisClient.keys(pattern);

      if (keys.length === 0) {
        return null;
      }

      const sessionKey = keys[0];
      const sessionData = await this.redisClient.hgetall(sessionKey);

      if (!sessionData || Object.keys(sessionData).length === 0) {
        return null;
      }

      const location = sessionData.location
        ? JSON.parse(sessionData.location)
        : undefined;

      return {
        sessionId: sessionData.sessionId,
        userId: sessionData.userId,
        email: sessionData.email,
        ip: sessionData.ip,
        userAgent: sessionData.userAgent,
        location,
        createdAt: new Date(sessionData.createdAt),
        lastActivityAt: new Date(sessionData.lastActivityAt),
        expiresAt: new Date(sessionData.expiresAt),
        isActive: sessionData.isActive === 'true',
      };
    } catch (error) {
      logger.error(`Erro ao buscar sessão ${sessionId}: ${error}`);
      return null;
    }
  }

  async findByUserId(userId: string): Promise<ISessionDTO[]> {
    try {
      const userSessionsKey = this.getUserSessionsKey(userId);
      const sessionIds = await this.redisClient.smembers(userSessionsKey);

      if (sessionIds.length === 0) {
        return [];
      }

      const sessions: ISessionDTO[] = [];

      for (const sessionId of sessionIds) {
        const session = await this.findById(sessionId);
        if (session) {
          sessions.push(session);
        }
      }

      return sessions;
    } catch (error) {
      logger.error(`Erro ao buscar sessões do usuário ${userId}: ${error}`);
      return [];
    }
  }

  async invalidate(sessionId: string): Promise<void> {
    try {
      const session = await this.findById(sessionId);

      if (!session) {
        logger.warn(`Tentativa de invalidar sessão inexistente: ${sessionId}`);
        return;
      }

      const sessionKey = this.getSessionKey(session.userId, sessionId);
      const userSessionsKey = this.getUserSessionsKey(session.userId);

      // Remove a sessão
      await this.redisClient.del(sessionKey);

      // Remove do set de sessões do usuário
      await this.redisClient.srem(userSessionsKey, sessionId);

      logger.info(`Sessão invalidada: ${sessionId}`);
    } catch (error) {
      logger.error(`Erro ao invalidar sessão ${sessionId}: ${error}`);
      throw error;
    }
  }

  async invalidateAll(userId: string): Promise<void> {
    try {
      const userSessionsKey = this.getUserSessionsKey(userId);
      const sessionIds = await this.redisClient.smembers(userSessionsKey);

      if (sessionIds.length === 0) {
        logger.info(`Nenhuma sessão ativa para invalidar do usuário ${userId}`);
        return;
      }

      // Deleta todas as chaves de sessão
      for (const sessionId of sessionIds) {
        const sessionKey = this.getSessionKey(userId, sessionId);
        await this.redisClient.del(sessionKey);
      }

      // Deleta o set de sessões do usuário
      await this.redisClient.del(userSessionsKey);

      logger.info(
        `${sessionIds.length} sessão(ões) invalidada(s) para usuário ${userId}`,
      );
    } catch (error) {
      logger.error(
        `Erro ao invalidar todas as sessões do usuário ${userId}: ${error}`,
      );
      throw error;
    }
  }

  async updateLastActivity(data: IUpdateSessionActivityDTO): Promise<void> {
    try {
      const session = await this.findById(data.sessionId);

      if (!session) {
        return;
      }

      const sessionKey = this.getSessionKey(session.userId, data.sessionId);

      const fields: string[] = [
        'lastActivityAt',
        data.lastActivityAt.toISOString(),
      ];

      if (data.expiresAt) {
        fields.push('expiresAt', data.expiresAt.toISOString());

        // Renova o TTL do Redis com base no novo expiresAt
        const newTtl = Math.floor(
          (data.expiresAt.getTime() - Date.now()) / 1000,
        );
        if (newTtl > 0) {
          await this.redisClient.expire(sessionKey, newTtl);
          const userSessionsKey = this.getUserSessionsKey(session.userId);
          await this.redisClient.expire(userSessionsKey, newTtl);
        }
      }

      await this.redisClient.hset(sessionKey, ...fields);
    } catch (error) {
      logger.error(
        `Erro ao atualizar atividade da sessão ${data.sessionId}: ${error}`,
      );
    }
  }

  async isActive(sessionId: string): Promise<boolean> {
    const session = await this.findById(sessionId);

    if (!session) {
      return false;
    }

    return session.isActive && new Date() < session.expiresAt;
  }
}
