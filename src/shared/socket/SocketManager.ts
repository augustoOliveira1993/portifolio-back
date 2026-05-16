import { logger } from '@shared/utils/logger';
import { Server as IOServer, Socket } from 'socket.io';
import dotenv from 'dotenv';
import { Server as HTTPServer } from 'http';

dotenv.config();

export enum SocketEvents {
  CONNECTION = 'connection',
  DISCONNECT = 'disconnect',
  NOTIFICACAO = 'notificacao',
  NOTIFICACAO_KAESIO = 'notificacao:6840762b0eecdb484fdb7a61',
}

export type SSLConfig = {
  keyPath: string;
  certPath: string;
  caPath?: string;
};

export type SocketManagerOptions = {
  port?: number | string;
  cors?: {
    origin: string;
    methods: string;
    credentials?: boolean;
  };
  ssl?: SSLConfig;
};

const defaultOptions: SocketManagerOptions = {
  cors: {
    origin: process.env.CORS || '*',
    methods: 'GET, POST',
    credentials: true,
  }
};

export class SocketManager {
  private static instance: SocketManager;
  private io!: IOServer;

  private constructor() {}

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  public initialize(server: HTTPServer, options?: SocketManagerOptions): void {
    if (this.io) return; // já inicializado

    this.io = new IOServer(server, options || defaultOptions);

    this.io.on(SocketEvents.CONNECTION, (socket: Socket) => {
      logger.info(`[Socket] Cliente conectado! id=${socket.id}, Origem=${socket.handshake.headers.origin}`);

      socket.on(SocketEvents.DISCONNECT, () => {
        logger.info(`[Socket] Cliente desconectado! id=${socket.id}, Origem=${socket.handshake.headers.origin}`);
      });
    });

    logger.info(`[Socket.IO] ${process.env.APP_WEB_URL}:${process.env.PORT} iniciado com sucesso`);
  }

  public emit(event: string, payload: any): void {
    if (!this.io) throw new Error('Socket.IO não inicializado');
    this.io.emit(event, payload);
  }

  public on(event: string, callback: (...args: any[]) => void): void {
    if (!this.io) throw new Error('Socket.IO não inicializado');
    this.io.on(event, callback);
  }

  public getIO(): IOServer {
    if (!this.io) throw new Error('Socket.IO não inicializado');
    return this.io;
  }
}