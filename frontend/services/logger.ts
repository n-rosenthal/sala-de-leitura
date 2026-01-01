// frontend/services/logger.ts

const LOG_LEVELS = {
    ERROR: 'error',
    WARN: 'warn',
    INFO: 'info',
    DEBUG: 'debug',
} as const;

type LogLevel = typeof LOG_LEVELS[keyof typeof LOG_LEVELS];

class Logger {
    /**
     * Formats a log message according to the given parameters.
     *
     * @param {LogLevel} level - The log level of the message.
     * @param {string} message - The message to log.
     * @param {*} [data] - Optional data to log with the message.
     * @returns {string} A formatted log message string.
     */
    private formatMessage(level: LogLevel, message: string, data?: any): string {
        const timestamp = new Date().toISOString();
        const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
        return `[${timestamp}] ${level.toUpperCase()}: ${message}${dataStr}`;
    }
    
    /**
     * Log an info message to the console.
     * 
     * @param {string} message - The message to log.
     * @param {*} [data] - Optional data to log with the message.
     */
    public info(message: string, data?: any) {
        console.info(this.formatMessage(LOG_LEVELS.INFO, message, data));
    }

    /**
     * Log an error message to the console.
     * 
     * @param {string} message - The message to log.
     * @param {*} [data] - Optional data to log with the message.
     */
    public error(message: string, data?: any) {
        console.error(this.formatMessage(LOG_LEVELS.ERROR, message, data));
    }

    /**
     * Log a warning message to the console.
     * 
     * @param {string} message - The message to log.
     * @param {*} [data] - Optional data to log with the message.
     */
    public warn(message: string, data?: any) {
        console.warn(this.formatMessage(LOG_LEVELS.WARN, message, data));
    }

    /**
     * Log a debug message, but only in development mode.
     * 
     * @param {string} message - The message to log.
     * @param {*} [data] - Optional data to log with the message.
     */
    public debug(message: string, data?: any) {
        if (process.env.NODE_ENV === 'development') {
            console.debug(this.formatMessage(LOG_LEVELS.DEBUG, message, data));
        }
    }
}

export const logger = new Logger();