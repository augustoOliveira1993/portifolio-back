import { SocketManager } from '@shared/socket/SocketManager';
import 'reflect-metadata';
import dotenv from 'dotenv';
import { AppServer, IHttpsServerOption } from './app';
import { logger } from '@shared/utils/logger';
import { readFileSync } from 'fs';
import { isEnabled } from '@configs/features.config';

dotenv.config();

const app = new AppServer();
const portServer = process.env.PORT;

if (isEnabled('SOCKET_MANAGER')) {
  SocketManager.getInstance().initialize(app.httpServer);
}

app.httpServer.listen(portServer, () => {
  logger.info(
    `🚀 API Base TS online ${process.env.APP_WEB_URL}:${portServer}`,
  );
});
