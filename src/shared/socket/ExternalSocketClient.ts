import { singleton } from 'tsyringe';
import { io, Socket } from 'socket.io-client';
import { logger } from '@shared/utils/logger';

type SocketOptions = {
  transports?: ('polling' | 'websocket')[];
  auth?: Record<string, any>;
  [key: string]: any;
};

/**
 * Exemplo de como instanciar e usar o ExternalSocketManager
 *
 * import { ExternalSocketManager } from '@shared/socket/ExternalSocketClient';
 * import { container } from 'tsyringe';
 * const socketManager = container.resolve(ExternalSocketManager);
 * socketManager.connect('https://localhost:3002');
 * socketManager.on('https://localhost:3002', 'teste123', (data) => {
 *  console.log('[3002] Notificação:', data);
 * });
 *
 */
@singleton()
export class ExternalSocketManager {
  private sockets: Map<string, Socket> = new Map();

  public connect(url: string, options: SocketOptions = {}) {
    if (this.sockets.has(url)) {
      logger.warn(`[External WS] Já conectado a ${url}`);
      return;
    }

    const socket = io(url, {
      transports: ['websocket'],
      rejectUnauthorized: false,
      ...options,
    });

    socket.on('connect', () => {
      logger.info(
        `[External WS:${url.split(':').slice(-1)}] Conectado a ${url} (id=${socket.id})`,
      );
    });

    socket.on('disconnect', (reason: string) => {
      logger.warn(`[External WS] Desconectado de ${url} - Motivo: ${reason}`);
    });

    socket.on('connect_error', (err: any) => {
      logger.error(`[External WS] Erro ao conectar em ${url}: ${err.message}`);
    });

    this.sockets.set(url, socket);
  }

  public getSocket(url: string): Socket {
    const socket = this.sockets.get(url);
    if (!socket) {
      throw new Error(
        `Socket para ${url} ainda não foi conectado. Use .connect(url) primeiro.`,
      );
    }
    return socket;
  }

  public on(url: string, event: string, callback: (...args: any[]) => void) {
    const socket = this.getSocket(url);
    socket.on(event, callback);
  }

  public emit(url: string, event: string, payload: any) {
    const socket = this.getSocket(url);
    socket.emit(event, payload);
  }

  public listConnections(): string[] {
    return Array.from(this.sockets.keys());
  }

  public disconnect(url: string) {
    const socket = this.sockets.get(url);
    if (socket) {
      socket.disconnect();
      this.sockets.delete(url);
      logger.info(`[External WS] Desconectado de ${url}`);
    }
  }

  public disconnectAll() {
    for (const [url, socket] of this.sockets) {
      socket.disconnect();
      logger.info(`[External WS] Desconectado de ${url}`);
    }
    this.sockets.clear();
  }
}
