import { createLogger, format, transports, Logger } from 'winston';
import { isDevelopment, isTest } from './secrets';

const { combine, timestamp, json, colorize, printf, errors } = format;

const humanReadable = printf((info) => {
  const { level, message, timestamp: at, stack, ...meta } = info;
  const text = stack ?? (typeof message === 'object' ? JSON.stringify(message) : message);
  const detail = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `${at} ${level}: ${text}${detail}`;
});

export const logger: Logger = createLogger({
  level: isDevelopment() ? 'debug' : 'info',
  format: isDevelopment() ? combine(errors({ stack: true }), timestamp({ format: 'HH:mm:ss' }), colorize(), humanReadable) : combine(errors({ stack: true }), timestamp(), json()),
  transports: [new transports.Console()],
  silent: isTest(),
});
