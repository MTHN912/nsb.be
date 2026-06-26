import { Injectable, LoggerService as NestLoggerService, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService implements NestLoggerService {
  private context?: string;
  private readonly logLevels: Set<string>;
  private readonly levelHandlers: Record<string, (message: string) => void>;

  constructor(private readonly configService: ConfigService) {
    const levels = this.configService.get('LOG_LEVELS') || 'error,warn,log';
    this.logLevels = new Set(levels.split(',').map(l => l.trim().toLowerCase()));
    
    this.levelHandlers = {
      error: console.error,
      warn: console.warn,
      log: console.log,
      debug: console.log,
      verbose: console.log,
    };
  }

  setContext(context: string) {
    this.context = context;
  }

  log(message: any, context?: string) {
    this.printMessage(message, 'LOG', context);
  }

  error(message: any, trace?: string, context?: string) {
    this.printMessage(message, 'ERROR', context);
    if (trace) {
      console.error(trace);
    }
  }

  warn(message: any, context?: string) {
    this.printMessage(message, 'WARN', context);
  }

  debug(message: any, context?: string) {
    this.printMessage(message, 'DEBUG', context);
  }

  verbose(message: any, context?: string) {
    this.printMessage(message, 'VERBOSE', context);
  }

  private printMessage(message: any, level: string, context?: string) {
    const levelLower = level.toLowerCase();
    
    if (!this.logLevels.has(levelLower)) {
      return;
    }

    const timestamp = new Date().toISOString();
    const ctx = context || this.context || 'Application';
    const logMessage = `[${timestamp}] [${level}] [${ctx}] ${message}`;
    
    const handler = this.levelHandlers[levelLower];
    if (handler) {
      handler(logMessage);
    }
  }
}
