import { container } from 'tsyringe';
import { ExternalSocketManager } from '@shared/socket/ExternalSocketClient';

import '@modules/log/container';
import '@modules/users/container';
import '@modules/notification/container';
import '@modules/session/container';
import '@modules/blogPost/container';
import '@modules/certification/container';
import '@modules/contact/container';
import '@modules/education/container';
import '@modules/experience/container';
import '@modules/project/container';
import '@modules/skill/container';

// Registro opcional (já funciona com @singleton)
container.registerSingleton<ExternalSocketManager>(
  'ExternalSocketManager',
  ExternalSocketManager,
);
