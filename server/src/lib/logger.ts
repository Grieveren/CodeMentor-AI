/**
 * Simple logger utility for the application
 * In production, this could be replaced with a more robust logging solution
 * like Winston or Pino
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  level?: LogLevel;
  prefix?: string;
}

class Logger {
  private level: LogLevel;
  private prefix: string;
  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor(options: LoggerOptions = {}) {
    this.level =
      options.level ||
      (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
    this.prefix = options.prefix || '';
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.levels[this.level];
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = this.prefix ? `[${this.prefix}] ` : '';
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${prefix}${message}${dataStr}`;
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog('debug') && process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.log(this.formatMessage('debug', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog('info')) {
      // eslint-disable-next-line no-console
      console.log(this.formatMessage('info', message, data));
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog('warn')) {
      // eslint-disable-next-line no-console
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  error(message: string, error?: any): void {
    if (this.shouldLog('error')) {
      // eslint-disable-next-line no-console
      console.error(this.formatMessage('error', message), error);
    }
  }
}

// Create default logger instance
export const logger = new Logger();

// Export factory function for creating custom loggers
export function createLogger(options: LoggerOptions): Logger {
  return new Logger(options);
}

// Export Logger class for type usage
export { Logger };
