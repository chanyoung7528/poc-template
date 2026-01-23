import { ERROR_MESSAGES, HTTP_STATUS } from "@/core/config/constants";

import { ApiError } from "./client";

const RETRY_CONFIG = {
  BASE_DELAY_MS: 1000,
  MAX_DELAY_MS: 30000,
} as const;

/**
 * 에러 분류 유틸리티
 * Layer 2.5 - Network와 Query Core 사이의 공용 레이어
 */
export const ErrorClassifier = {
  /**
   * 재시도 가능 여부 판단
   */
  isRetriable: (error: unknown): boolean => {
    if (!(error instanceof ApiError)) return false;
    const { status } = error;
    return (
      status === 0 || // 네트워크 에러
      status === HTTP_STATUS.REQUEST_TIMEOUT ||
      status === HTTP_STATUS.TOO_MANY_REQUESTS ||
      status >= HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  },

  /**
   * 전역 처리 대상 여부 판단
   */
  shouldHandleGlobally: (error: unknown): boolean => {
    if (!(error instanceof ApiError)) return false;
    const { status } = error;
    return (
      status === 0 ||
      status === HTTP_STATUS.REQUEST_TIMEOUT ||
      status === HTTP_STATUS.FORBIDDEN ||
      status === HTTP_STATUS.TOO_MANY_REQUESTS ||
      status >= HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  },

  /**
   * 인증 에러 여부
   */
  isAuthError: (error: unknown): boolean => {
    if (!(error instanceof ApiError)) return false;
    return (
      error.status === HTTP_STATUS.UNAUTHORIZED ||
      error.status === HTTP_STATUS.FORBIDDEN
    );
  },

  /**
   * 클라이언트 에러 여부 (400-499)
   */
  isClientError: (error: unknown): boolean => {
    if (!(error instanceof ApiError)) return false;
    return (
      error.status >= HTTP_STATUS.BAD_REQUEST &&
      error.status < HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  },

  /**
   * 서버 에러 여부 (500-599)
   */
  isServerError: (error: unknown): boolean => {
    if (!(error instanceof ApiError)) return false;
    return error.status >= HTTP_STATUS.INTERNAL_SERVER_ERROR;
  },

  /**
   * 네트워크 에러 여부
   */
  isNetworkError: (error: unknown): boolean => {
    if (!(error instanceof ApiError)) return false;
    return error.status === 0;
  },

  /**
   * 사용자에게 표시할 에러 메시지 반환
   */
  getUserMessage: (error: unknown): { title: string; description?: string } => {
    if (error instanceof ApiError) {
      const { status } = error;

      // 429 Rate Limit
      if (status === HTTP_STATUS.TOO_MANY_REQUESTS) {
        const retryAfterSeconds = error.retryAfterMs
          ? Math.ceil(error.retryAfterMs / 1000)
          : null;
        return {
          title: ERROR_MESSAGES.TOO_MANY_REQUESTS,
          description: retryAfterSeconds
            ? `${retryAfterSeconds}초 후 다시 시도해주세요.`
            : undefined,
        };
      }

      // 408 Request Timeout
      if (status === HTTP_STATUS.REQUEST_TIMEOUT) {
        return { title: ERROR_MESSAGES.TIMEOUT };
      }

      // 403 Forbidden
      if (status === HTTP_STATUS.FORBIDDEN) {
        return {
          title: ERROR_MESSAGES.FORBIDDEN,
          description: ERROR_MESSAGES.FORBIDDEN_DESC,
        };
      }

      // 5xx Server Error
      if (status >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
        return {
          title: ERROR_MESSAGES.SERVER,
          description: error.message || ERROR_MESSAGES.SERVER_DESC,
        };
      }

      // 네트워크 에러 (status 0)
      if (status === 0) {
        return { title: ERROR_MESSAGES.NETWORK };
      }
    }

    return { title: ERROR_MESSAGES.UNKNOWN };
  },

  /**
   * 재시도 지연 시간 계산 (Exponential Backoff)
   * 429 에러의 경우 Retry-After 헤더 값을 우선 사용
   */
  getRetryDelay: (failureCount: number, error: unknown): number => {
    if (error instanceof ApiError && typeof error.retryAfterMs === "number") {
      return error.retryAfterMs;
    }
    return Math.min(
      RETRY_CONFIG.BASE_DELAY_MS * 2 ** Math.max(0, failureCount),
      RETRY_CONFIG.MAX_DELAY_MS
    );
  },
} as const;
