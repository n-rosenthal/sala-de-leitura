/**
 * `services/logger.ts` — logger estruturado
 *
 * Emite logs formatados com timestamp, nível e contexto opcional.
 * Em produção, suprime mensagens DEBUG.
 * Integrado ao `api.ts` para rastrear erros de rede e ciclos de refresh.
 */

// Tipos

const LOG_LEVELS = {
    ERROR: "error",
    WARN: "warn",
    INFO: "info",
    DEBUG: "debug",
} as const;

type LogLevel = (typeof LOG_LEVELS)[keyof typeof LOG_LEVELS];

interface LogEntry {
    timestamp: string;
    level: string;
    message: string;
    data?: unknown;
}


class Logger {
    private readonly isDev = process.env.NODE_ENV === "development";

    private format(level: LogLevel, message: string, data?: unknown): LogEntry {
        return {
            timestamp: new Date().toISOString(),
            level: level.toUpperCase(),
            message,
            ...(data !== undefined && { data }),
        };
    }

    private print(
        level: LogLevel,
        entry: LogEntry,
        consoleFn: (...args: unknown[]) => void
    ): void {
        const prefix = `[${entry.timestamp}] ${entry.level}: ${entry.message}`;
        entry.data !== undefined ? consoleFn(prefix, entry.data) : consoleFn(prefix);
    }

    info(message: string, data?: unknown): void {
        this.print(
            LOG_LEVELS.INFO,
            this.format(LOG_LEVELS.INFO, message, data),
            console.info.bind(console)
        );
    }

    error(message: string, data?: unknown): void {
        this.print(
            LOG_LEVELS.ERROR,
            this.format(LOG_LEVELS.ERROR, message, data),
            console.error.bind(console)
        );
    }

    warn(message: string, data?: unknown): void {
        this.print(
            LOG_LEVELS.WARN,
            this.format(LOG_LEVELS.WARN, message, data),
            console.warn.bind(console)
        );
    }

    /** Emitido apenas em desenvolvimento (`NODE_ENV === "development"`). */
    debug(message: string, data?: unknown): void {
        if (!this.isDev) return;
        this.print(
            LOG_LEVELS.DEBUG,
            this.format(LOG_LEVELS.DEBUG, message, data),
            console.debug.bind(console)
        );
    }
} 

export const logger = new Logger();