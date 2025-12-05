import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

enum LogLevel {
    ERROR = 'ERROR',
    WARN = 'WARN',
    INFO = 'INFO',
    DEBUG = 'DEBUG',
}

class Logger {
    private logDir: string;
    private logFile: string;

    constructor() {
        this.logDir = join(process.cwd(), 'logs');
        this.logFile = join(this.logDir, 'penguinblur.log');

        // Ensure log directory exists
        if (!existsSync(this.logDir)) {
            mkdirSync(this.logDir, { recursive: true });
        }
    }

    private writeLog(level: LogLevel, message: string, meta?: any): void {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            ...(meta && { meta }),
        };

        const logLine = JSON.stringify(logEntry) + '\n';

        // Write to file
        const stream = createWriteStream(this.logFile, { flags: 'a' });
        stream.write(logLine);
        stream.end();

        // Also log to console in development
        if (process.env.NODE_ENV !== 'production') {
            const consoleMessage = `[${timestamp}] ${level}: ${message}`;
            switch (level) {
                case LogLevel.ERROR:
                    console.error(consoleMessage, meta || '');
                    break;
                case LogLevel.WARN:
                    console.warn(consoleMessage, meta || '');
                    break;
                case LogLevel.DEBUG:
                    console.debug(consoleMessage, meta || '');
                    break;
                default:
                    console.log(consoleMessage, meta || '');
            }
        }
    }

    error(message: string, meta?: any): void {
        this.writeLog(LogLevel.ERROR, message, meta);
    }

    warn(message: string, meta?: any): void {
        this.writeLog(LogLevel.WARN, message, meta);
    }

    info(message: string, meta?: any): void {
        this.writeLog(LogLevel.INFO, message, meta);
    }

    debug(message: string, meta?: any): void {
        this.writeLog(LogLevel.DEBUG, message, meta);
    }
}

export const logger = new Logger();
