import { isDebug } from '@core/config';

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'api';

/**
 * Logger Utility
 *
 * - 개발 환경(Debug 모드): 콘솔에 컬러풀한 로그 출력
 * - 프로덕션 환경: 에러 로그만 출력 (추후 Sentry 등 연동 가능)
 */
class Logger {
  private enabled: boolean;

  constructor(enabled = isDebug) {
    this.enabled = enabled;
  }

  private shouldLog(level: LogLevel): boolean {
    // 에러는 항상 출력, 나머지는 enabled 상태에 따라
    return level === 'error' || this.enabled;
  }

  private formatMessage(level: LogLevel): string[] {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[${level.toUpperCase()}] ${timestamp}`;

    // 브라우저 콘솔 스타일링
    const styles: Record<LogLevel, string> = {
      debug: 'color: #9CA3AF;', // Gray
      info: 'color: #3B82F6; font-weight: bold;', // Blue
      warn: 'color: #F59E0B; font-weight: bold;', // Amber
      error: 'color: #EF4444; font-weight: bold;', // Red
      api: 'color: #10B981; font-weight: bold;', // Green
    };

    return [`%c${prefix}`, styles[level]];
  }

  private log(level: LogLevel, ...args: unknown[]) {
    if (!this.shouldLog(level)) return;

    const [prefix, style] = this.formatMessage(level);

    /* eslint-disable no-console */
    switch (level) {
      case 'error':
        console.error(prefix, style, ...args);
        break;
      case 'warn':
        console.warn(prefix, style, ...args);
        break;
      default:
        console.log(prefix, style, ...args);
    }
    /* eslint-enable no-console */
  }

  debug(...args: unknown[]) {
    this.log('debug', ...args);
  }

  info(...args: unknown[]) {
    this.log('info', ...args);
  }

  warn(...args: unknown[]) {
    this.log('warn', ...args);
  }

  error(...args: unknown[]) {
    this.log('error', ...args);
  }

  /**
   * API 요청/응답 로그 전용
   */
  api(method: string, url: string, status?: number, duration?: number) {
    const icon = status && status >= 400 ? '❌' : '✅';
    const durationText = duration ? `(${duration}ms)` : '';
    this.log('api', `${icon} ${method} ${url} ${status ?? ''} ${durationText}`);
  }
}

export const logger = new Logger();
