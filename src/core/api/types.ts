/**
 * API 공통 타입 정의
 */

/** 성공 응답 (데이터 포함) */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/** 페이지네이션 메타데이터 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** 페이지네이션 응답 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/** 에러 응답 */
export interface ApiErrorResponse {
  code: string;
  message: string;
  details?: unknown;
}
