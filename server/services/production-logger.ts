
import winston from 'winston';
import path from 'path';

interface LogMetadata {
  userId?: number;
  sessionId?: string;
  component?: string;
  operation?: string;
  duration?: number;
  cost?: number;
  [key: string]: any;
}

class ProductionLogger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return JSON.stringify({
            timestamp,
            level: level.toUpperCase(),
            message,
            ...meta
          });
        })
      ),
      defaultMeta: {
        service: 'wai-devsphere',
        version: process.env.APP_VERSION || '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      },
      transports: [
        // Console transport
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
            winston.format.printf(({ timestamp, level, message, component, operation, ...meta }) => {
              const metaStr = Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : '';
              const componentStr = component ? `[${component}]` : '';
              const operationStr = operation ? `(${operation})` : '';
              return `${timestamp} ${level} ${componentStr}${operationStr}: ${message} ${metaStr}`;
            })
          )
        }),

        // File transport for errors
        new winston.transports.File({
          filename: path.join(process.cwd(), 'logs', 'error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),

        // File transport for all logs
        new winston.transports.File({
          filename: path.join(process.cwd(), 'logs', 'combined.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 10,
        })
      ],
    });

    // Create logs directory if it doesn't exist
    const fs = require('fs');
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  info(message: string, meta: LogMetadata = {}) {
    this.logger.info(message, meta);
  }

  error(message: string, error?: Error, meta: LogMetadata = {}) {
    this.logger.error(message, {
      ...meta,
      error: error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : undefined
    });
  }

  warn(message: string, meta: LogMetadata = {}) {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta: LogMetadata = {}) {
    this.logger.debug(message, meta);
  }

  // Specialized logging methods
  logAgentExecution(agentId: string, task: string, result: any, meta: LogMetadata = {}) {
    this.info(`Agent execution completed`, {
      ...meta,
      component: 'agent-execution',
      operation: 'execute',
      agentId,
      task,
      success: result.success || false,
      duration: result.duration,
      cost: result.cost
    });
  }

  logUserAction(userId: number, action: string, details: any, meta: LogMetadata = {}) {
    this.info(`User action performed`, {
      ...meta,
      component: 'user-action',
      operation: action,
      userId,
      details
    });
  }

  logAPIRequest(method: string, url: string, statusCode: number, duration: number, meta: LogMetadata = {}) {
    const level = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warn' : 'info';
    
    this.logger.log(level, `API request completed`, {
      ...meta,
      component: 'api',
      operation: 'request',
      method,
      url,
      statusCode,
      duration
    });
  }

  logPromptEnhancement(
    originalPrompt: string,
    enhancedPrompt: string,
    provider: string,
    cost: number,
    meta: LogMetadata = {}
  ) {
    this.info(`Prompt enhancement completed`, {
      ...meta,
      component: 'prompt-enhancement',
      operation: 'enhance',
      originalLength: originalPrompt.length,
      enhancedLength: enhancedPrompt.length,
      provider,
      cost
    });
  }

  logContentGeneration(
    type: string,
    provider: string,
    success: boolean,
    cost: number,
    meta: LogMetadata = {}
  ) {
    this.info(`Content generation ${success ? 'completed' : 'failed'}`, {
      ...meta,
      component: 'content-generation',
      operation: 'generate',
      contentType: type,
      provider,
      success,
      cost
    });
  }

  logRefinementIteration(
    sessionId: string,
    iterationNumber: number,
    satisfaction: number,
    cost: number,
    meta: LogMetadata = {}
  ) {
    this.info(`Refinement iteration completed`, {
      ...meta,
      component: 'iterative-refinement',
      operation: 'iterate',
      sessionId,
      iterationNumber,
      satisfaction,
      cost
    });
  }

  logSystemHealth(component: string, status: 'healthy' | 'degraded' | 'unhealthy', details: any) {
    const level = status === 'healthy' ? 'info' : status === 'degraded' ? 'warn' : 'error';
    
    this.logger.log(level, `System health check`, {
      component: 'system-health',
      operation: 'health-check',
      healthComponent: component,
      status,
      details
    });
  }

  logPerformanceMetric(operation: string, duration: number, meta: LogMetadata = {}) {
    this.info(`Performance metric recorded`, {
      ...meta,
      component: 'performance',
      operation,
      duration,
      slow: duration > 5000 // Flag slow operations (>5s)
    });
  }

  // Create child logger for specific components
  child(defaultMeta: LogMetadata) {
    return {
      info: (message: string, meta: LogMetadata = {}) => 
        this.info(message, { ...defaultMeta, ...meta }),
      error: (message: string, error?: Error, meta: LogMetadata = {}) => 
        this.error(message, error, { ...defaultMeta, ...meta }),
      warn: (message: string, meta: LogMetadata = {}) => 
        this.warn(message, { ...defaultMeta, ...meta }),
      debug: (message: string, meta: LogMetadata = {}) => 
        this.debug(message, { ...defaultMeta, ...meta })
    };
  }
}

export const productionLogger = new ProductionLogger();

// Express middleware for request logging
export const requestLogger = (req: any, res: any, next: any) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    productionLogger.logAPIRequest(
      req.method,
      req.url,
      res.statusCode,
      duration,
      {
        userId: req.user?.id,
        userAgent: req.get('User-Agent'),
        ip: req.ip
      }
    );
  });
  
  next();
};
