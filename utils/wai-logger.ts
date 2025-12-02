/**
 * WAI Logging System
 * Production-ready logging with multiple levels and structured output
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info', 
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  component: string;
  data?: any;
  error?: Error;
  requestId?: string;
  agentId?: string;
}

export class WAILogger {
  private component: string;
  
  constructor(component: string) {
    this.component = component;
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, error?: Error, data?: any): void {
    this.log(LogLevel.ERROR, message, data, error);
  }

  fatal(message: string, error?: Error, data?: any): void {
    this.log(LogLevel.FATAL, message, data, error);
  }

  private log(level: LogLevel, message: string, data?: any, error?: Error): void {
    const entry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      component: this.component,
      data,
      error
    };

    // Production logging output
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(entry));
    } else {
      const timestamp = entry.timestamp.toISOString();
      const levelStr = `[${level.toUpperCase()}]`;
      const componentStr = `[${this.component}]`;
      
      console.log(`${timestamp} ${levelStr} ${componentStr} ${message}`, data || '');
      if (error) {
        console.error(error);
      }
    }
  }
}

// Factory function for creating loggers
export function createLogger(component: string): WAILogger {
  return new WAILogger(component);
}

// Default export
export default createLogger;