import {
  API_CONFIG,
  ERROR_MESSAGES,
  HTTP_STATUS,
  isDev,
  SERVER_CONFIG,
} from "@/core/config/constants";
import { logger } from "@/core/lib/logger";

import { authEvents } from "./auth-events";

/**
 * API 에러 클래스
 * Network Layer에서 발생하는 모든 에러를 표준화
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public data?: unknown,
    public originalError?: unknown,
    public retryAfterMs?: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type ApiRequestOptions = RequestInit & {
  params?: Record<string, unknown>;
  skipAuth?: boolean;
  next?: NextFetchRequestConfig;
};

type InternalRequestOptions = ApiRequestOptions & {
  _isRefreshing?: boolean;
};

// Silent Refresh 제외 대상 Endpoint
const AUTH_ENDPOINTS = [
  "/auth/refresh",
  "/auth/login",
  "/auth/logout",
] as const;

class ApiClient {
  private baseUrl: string;
  private refreshPromise: Promise<void> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * URL 생성 및 쿼리 파라미터 조합
   */
  private buildUrl(path: string, params?: Record<string, unknown>): string {
    let url = path;
    if (!path.startsWith("http")) {
      const base = this.baseUrl.endsWith("/")
        ? this.baseUrl.slice(0, -1)
        : this.baseUrl;
      const endpoint = path.startsWith("/") ? path : `/${path}`;
      url = `${base}${endpoint}`;
    }

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;
        if (Array.isArray(value)) {
          value.forEach((v) => searchParams.append(key, String(v)));
        } else {
          searchParams.append(key, String(value));
        }
      });

      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes("?") ? "&" : "?") + queryString;
      }
    }

    return url;
  }

  /**
   * 429 Too Many Requests의 Retry-After 헤더 파싱
   */
  private getRetryAfterMs(response: Response): number | undefined {
    const header = response.headers.get("Retry-After");
    if (!header) return undefined;

    const seconds = Number(header);
    if (!Number.isNaN(seconds)) return seconds * 1000;

    const date = new Date(header).getTime();
    return Number.isNaN(date) ? undefined : Math.max(0, date - Date.now());
  }

  /**
   * 토큰 갱신 (Promise Caching으로 중복 요청 방지)
   */
  private async refreshTokens(): Promise<void> {
    if (this.refreshPromise) return this.refreshPromise;

    this.refreshPromise = (async () => {
      try {
        await this.request("/api/auth/refresh", {
          method: "POST",
          _isRefreshing: true,
        });
        logger.info("Token refreshed successfully");
      } catch (error) {
        authEvents.emit("refresh-failed", { error });
        throw error;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Response Content-Type 기반 파싱
   */
  private async parseResponse<T>(response: Response): Promise<T> {
    // 204 No Content
    if (response.status === HTTP_STATUS.NO_CONTENT) {
      return undefined as T;
    }

    const contentType = response.headers.get("Content-Type");

    if (contentType?.includes("application/json")) {
      return response.json();
    }

    if (contentType?.includes("text/")) {
      return response.text() as Promise<T>;
    }

    if (
      contentType?.includes("application/octet-stream") ||
      contentType?.includes("image/") ||
      contentType?.includes("video/")
    ) {
      return response.blob() as Promise<T>;
    }

    // Default: JSON
    return response.json();
  }

  /**
   * 통합 요청 메서드
   */
  private async request<T>(
    path: string,
    options: InternalRequestOptions = {}
  ): Promise<T> {
    const { params, skipAuth, next, _isRefreshing, body, headers, ...init } =
      options;
    const targetUrl = this.buildUrl(path, params);

    const reqHeaders = new Headers(headers);
    if (!reqHeaders.has("Accept-Language")) {
      reqHeaders.set("Accept-Language", API_CONFIG.ACCEPT_LANGUAGE);
    }

    let reqBody = body;
    if (
      body &&
      typeof body === "object" &&
      !(body instanceof FormData) &&
      !(body instanceof Blob) &&
      !(body instanceof URLSearchParams)
    ) {
      reqBody = JSON.stringify(body);
      if (!reqHeaders.has("Content-Type"))
        reqHeaders.set("Content-Type", "application/json");
    }

    const timeoutSignal = AbortSignal.timeout(API_CONFIG.TIMEOUT);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const signal = init.signal
      ? (AbortSignal as any).any([init.signal, timeoutSignal])
      : timeoutSignal;

    const startTime = performance.now();
    let responseStatus: number | undefined;

    try {
      const response = await fetch(targetUrl, {
        ...init,
        signal,
        headers: reqHeaders,
        body: reqBody as BodyInit,
        credentials: skipAuth ? "omit" : "include",
        next,
      });

      responseStatus = response.status;

      // 401 Unauthorized → Silent Refresh
      if (response.status === HTTP_STATUS.UNAUTHORIZED && !_isRefreshing) {
        const isAuthEndpoint = AUTH_ENDPOINTS.some((endpoint) =>
          path.includes(endpoint)
        );

        if (!isAuthEndpoint) {
          try {
            await this.refreshTokens();
            return this.request<T>(path, { ...options, _isRefreshing: true });
          } catch {
            logger.debug("Token refresh failed, throwing 401");
          }
        }
      }

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: response.statusText }));
        const retryAfterMs =
          response.status === HTTP_STATUS.TOO_MANY_REQUESTS
            ? this.getRetryAfterMs(response)
            : undefined;

        throw new ApiError(
          response.status,
          errorData.code || "API_ERROR",
          errorData.message || response.statusText,
          errorData,
          undefined,
          retryAfterMs
        );
      }

      return this.parseResponse<T>(response);
    } catch (error) {
      if (timeoutSignal.aborted) {
        responseStatus = HTTP_STATUS.REQUEST_TIMEOUT;
        throw new ApiError(
          HTTP_STATUS.REQUEST_TIMEOUT,
          "REQUEST_TIMEOUT",
          ERROR_MESSAGES.TIMEOUT,
          undefined,
          error
        );
      }

      if (error instanceof ApiError) {
        responseStatus = error.status;
        throw error;
      }

      responseStatus = 0;
      throw new ApiError(
        0,
        "NETWORK_ERROR",
        ERROR_MESSAGES.NETWORK,
        undefined,
        error
      );
    } finally {
      const duration = Math.round(performance.now() - startTime);
      logger.api(init.method || "GET", targetUrl, responseStatus, duration);
    }
  }

  get<T>(url: string, options?: ApiRequestOptions) {
    return this.request<T>(url, { ...options, method: "GET" });
  }

  post<T>(url: string, data?: unknown, options?: ApiRequestOptions) {
    return this.request<T>(url, {
      ...options,
      method: "POST",
      body: data as BodyInit,
    });
  }

  put<T>(url: string, data?: unknown, options?: ApiRequestOptions) {
    return this.request<T>(url, {
      ...options,
      method: "PUT",
      body: data as BodyInit,
    });
  }

  delete<T>(url: string, options?: ApiRequestOptions) {
    return this.request<T>(url, { ...options, method: "DELETE" });
  }

  patch<T>(url: string, data?: unknown, options?: ApiRequestOptions) {
    return this.request<T>(url, {
      ...options,
      method: "PATCH",
      body: data as BodyInit,
    });
  }
}

const getBaseUrl = () => {
  if (typeof window === "undefined" && isDev && SERVER_CONFIG.API_TARGET_URL) {
    return SERVER_CONFIG.API_TARGET_URL;
  }
  return API_CONFIG.BASE_URL;
};

export const apiClient = new ApiClient(getBaseUrl());
