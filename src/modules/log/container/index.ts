import { container } from 'tsyringe';

import ILogRepository from '@modules/log/repositories/ILogRepository';
import LogRepository from '@modules/log/infra/mongo/repositories/LogRepository';

container.registerSingleton<ILogRepository>('LogRepository', LogRepository);
