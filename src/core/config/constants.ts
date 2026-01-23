import { env } from './env';

export const API_CONFIG = {
  BASE_URL: env.API_URL,
  TIMEOUT: env.API_TIMEOUT,
  ACCEPT_LANGUAGE: env.API_ACCEPT_LANGUAGE ?? 'ko-KR',
} as const;

export const APP_METADATA = {
  NAME: 'Wellness AI',
  DESCRIPTION: 'Wellness AI Health care application client',
  VERSION: '0.1.0',
} as const;

export const SERVER_CONFIG = {
  API_TARGET_URL: env.API_TARGET_URL,
} as const;

export const CACHE_CONFIG = {
  QUERY_STALE_TIME: 60000,
  QUERY_GC_TIME: 300000,
} as const;

export const HTTP_STATUS = {
  OK: 200,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  REQUEST_TIMEOUT: 408,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const UI_CONFIG = {
  TOAST_DURATION: 3000,
  ERROR_DEBOUNCE_TIME: 3000,
} as const;

export const ERROR_MESSAGES = {
  UNKNOWN: '알 수 없는 오류가 발생했습니다.',
  NETWORK: '네트워크 연결 상태를 확인해주세요.',
  TIMEOUT: '요청 시간이 초과되었습니다.',
  TOO_MANY_REQUESTS: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
  FORBIDDEN: '접근 권한이 없습니다.',
  FORBIDDEN_DESC: '로그인이 필요하거나 권한이 부족합니다.',
  SERVER: '서버 오류가 발생했습니다.',
  SERVER_DESC: '잠시 후 다시 시도해주세요.',
} as const;

export const isAnalyze = env.ANALYZE;
export const isDev = env.NODE_ENV === 'development';
export const isDebug = env.FEATURE_DEBUG;
