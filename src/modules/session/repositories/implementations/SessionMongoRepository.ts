import { logger } from '@shared/utils/logger';
import { v4 as uuidv4 } from 'uuid';
import {
  ICreateSessionDTO,
  ISessionDTO,
  IUpdateSessionActivityDTO,
} from '../../dto/ISessionDTO';
import ISessionRepository from '../ISessionRepository';
import { Session } from '../../infra/mongo/models/Session';

export default class SessionMongoRepository implements ISessionRepository {
  async create(data: ICreateSessionDTO): Promise<ISessionDTO> {
    const sessionId = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + data.expiresIn);

    try {
      const session = await Session.create({
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
      });

      logger.info(
        `Sessão criada no MongoDB: ${sessionId} para usuário ${data.userId}`,
      );

      return {
        sessionId: session.sessionId,
        userId: session.userId,
        email: session.email,
        ip: session.ip,
        userAgent: session.userAgent,
        location: session.location,
        createdAt: session.createdAt,
        lastActivityAt: session.lastActivityAt,
        expiresAt: session.expiresAt,
        isActive: session.isActive,
      };
    } catch (error) {
      logger.error(`Erro ao criar sessão no MongoDB: ${error}`);
      throw error;
    }
  }

  async findById(sessionId: string): Promise<ISessionDTO | null> {
    try {
      const session = await Session.findOne({ sessionId }).lean();

      if (!session) {
        return null;
      }

      return {
        sessionId: session.sessionId,
        userId: session.userId,
        email: session.email,
        ip: session.ip,
        userAgent: session.userAgent,
        location: session.location,
        createdAt: session.createdAt,
        lastActivityAt: session.lastActivityAt,
        expiresAt: session.expiresAt,
        isActive: session.isActive,
      };
    } catch (error) {
      logger.error(`Erro ao buscar sessão ${sessionId} no MongoDB: ${error}`);
      return null;
    }
  }

  async findByUserId(userId: string): Promise<ISessionDTO[]> {
    try {
      const sessions = await Session.find({
        userId,
        isActive: true,
        expiresAt: { $gt: new Date() },
      })
        .sort({ createdAt: -1 })
        .lean();

      return sessions.map(session => ({
        sessionId: session.sessionId,
        userId: session.userId,
        email: session.email,
        ip: session.ip,
        userAgent: session.userAgent,
        location: session.location,
        createdAt: session.createdAt,
        lastActivityAt: session.lastActivityAt,
        expiresAt: session.expiresAt,
        isActive: session.isActive,
      }));
    } catch (error) {
      logger.error(
        `Erro ao buscar sessões do usuário ${userId} no MongoDB: ${error}`,
      );
      return [];
    }
  }

  async invalidate(sessionId: string): Promise<void> {
    try {
      const result = await Session.updateOne(
        { sessionId },
        { $set: { isActive: false } },
      );

      if (result.modifiedCount > 0) {
        logger.info(`Sessão invalidada no MongoDB: ${sessionId}`);
      } else {
        logger.warn(
          `Tentativa de invalidar sessão inexistente no MongoDB: ${sessionId}`,
        );
      }
    } catch (error) {
      logger.error(
        `Erro ao invalidar sessão ${sessionId} no MongoDB: ${error}`,
      );
      throw error;
    }
  }

  async invalidateAll(userId: string): Promise<void> {
    try {
      const result = await Session.updateMany(
        { userId, isActive: true },
        { $set: { isActive: false } },
      );

      logger.info(
        `${result.modifiedCount} sessão(ões) invalidada(s) no MongoDB para usuário ${userId}`,
      );
    } catch (error) {
      logger.error(
        `Erro ao invalidar todas as sessões do usuário ${userId} no MongoDB: ${error}`,
      );
      throw error;
    }
  }

  async updateLastActivity(data: IUpdateSessionActivityDTO): Promise<void> {
    try {
      const updateFields: Record<string, any> = {
        lastActivityAt: data.lastActivityAt,
      };

      if (data.expiresAt) {
        updateFields.expiresAt = data.expiresAt;
      }

      await Session.updateOne(
        { sessionId: data.sessionId },
        { $set: updateFields },
      );
    } catch (error) {
      logger.error(
        `Erro ao atualizar atividade da sessão ${data.sessionId} no MongoDB: ${error}`,
      );
    }
  }

  async isActive(sessionId: string): Promise<boolean> {
    try {
      const session = await Session.findOne({
        sessionId,
        isActive: true,
        expiresAt: { $gt: new Date() },
      }).lean();

      const isActive = session !== null;

      return isActive;
    } catch (error) {
      logger.error(
        `Erro ao verificar se sessão ${sessionId} está ativa no MongoDB: ${error}`,
      );
      return false;
    }
  }
}
