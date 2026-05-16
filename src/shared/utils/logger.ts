import winston from 'winston';
import { format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import moment from 'moment-timezone';

const fileLogFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

const jsonLogFileFormat = winston.format.combine(
  winston.format.errors({ stack: true }),
  winston.format.timestamp(),
  winston.format.prettyPrint(),
);

let env = 'production';
if (process.env?.NODE_ENV) {
  env = process.env.NODE_ENV;
}

const level = env === 'production' ? 'info' : 'debug';

// Create file loggers
const logger = winston.createLogger({
  level,
  format: jsonLogFileFormat,
  // expressFormat: true,

  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.errors({ stack: true }),
        winston.format.colorize(),
        // eslint-disable-next-line no-shadow
        winston.format.printf(({ level, message, timestamp, stack }) => {
          if (stack) {
            // print log trace
            return `${level}: ${timestamp} ${message} - ${stack}`;
          }
          return `${level}: ${timestamp} ${message}`;
        }),
      ),
    }),

    // new winston.transports.File({
    //   filename: path.resolve(
    //     'logs',
    //     'errors',
    //     `avb_errors_${moment(new Date()).format('DD_MM_YYYY')}.log`,
    //   ),
    //   level: 'error',
    //   handleExceptions: true,
    //   maxsize: 10485760,
    //   maxFiles: 10,
    // }),

    new winston.transports.File({
      filename: path.resolve(
        'logs',
        'infos',
        `avb_infos_${moment(new Date()).format('DD_MM_YYYY')}.log`,
      ),
      level: 'info',
      handleExceptions: true,
      maxsize: 10485760,
      maxFiles: 10,
    }),
    // new winston.transports.File({
    //   filename: path.resolve(
    //     'logs',
    //     'debugs',
    //     `avb_debugs_${moment(new Date()).format('DD_MM_YYYY')}.log`,
    //   ),
    //   level: 'debug',
    //   handleExceptions: true,
    //   maxsize: 10485760,
    //   maxFiles: 10,
    // }),
    new winston.transports.Http({
      level: 'warn',
      format: winston.format.json(),
    }),
  ],
});

function addLogRotate(workspace: string): void {
  const logRotate = new DailyRotateFile({
    format: format.combine(
      winston.format.splat(),
      winston.format.timestamp(),
      winston.format.padLevels(),
      fileLogFormat,
    ),
    level: 'debug',
    filename: path.resolve(workspace, 'logs', 'modelo-api-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '7d',
  });

  logger.add(logRotate);
}

export { addLogRotate, logger };
