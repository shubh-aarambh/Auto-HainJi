import winston from 'winston';
import { eventBus } from '../events/EventBus';
import { AgentEvent } from '../events/AgentEvents';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
});

const winstonLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        logFormat
      )
    }),
    new winston.transports.File({ 
      filename: path.join(logsDir, 'agent.log'),
      options: { flags: 'w' } // Overwrite log file each run
    })
  ]
});

// A wrapper logger to emit events to EventBus
export const logger = {
  info: (message: string) => {
    winstonLogger.info(message);
    eventBus.emit(AgentEvent.LOG_ADDED, {
      level: 'INFO',
      message,
      timestamp: new Date().toLocaleTimeString()
    });
  },
  success: (message: string) => {
    winstonLogger.info(`SUCCESS: ${message}`);
    eventBus.emit(AgentEvent.LOG_ADDED, {
      level: 'SUCCESS',
      message,
      timestamp: new Date().toLocaleTimeString()
    });
  },
  warn: (message: string) => {
    winstonLogger.warn(message);
    eventBus.emit(AgentEvent.LOG_ADDED, {
      level: 'WARNING',
      message,
      timestamp: new Date().toLocaleTimeString()
    });
  },
  error: (message: string, error?: any) => {
    const errMsg = error ? `${message} - ${error.message || error}` : message;
    winstonLogger.error(errMsg);
    eventBus.emit(AgentEvent.LOG_ADDED, {
      level: 'ERROR',
      message: errMsg,
      timestamp: new Date().toLocaleTimeString()
    });
  }
};
