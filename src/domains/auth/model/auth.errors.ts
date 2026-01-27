/**
 * 인증 관련 에러 코드 및 메시지 맵
 *
 * 백엔드에서 반환하는 에러 코드를 기준으로 사용자 친화적인 메시지로 변환
 */

export const AUTH_ERROR_CODES = {
  // 인증 실패
  INVALID_CREDENTIALS: "AUTH_INVALID_CREDENTIALS",
  USER_NOT_FOUND: "AUTH_USER_NOT_FOUND",
  INVALID_PASSWORD: "AUTH_INVALID_PASSWORD",

  // 계정 상태
  DUPLICATED_ACCOUNT: "AUTH_DUPLICATED_ACCOUNT",
  DUPLICATED_PHONE: "AUTH_DUPLICATED_PHONE",
  DUPLICATED_EMAIL: "AUTH_DUPLICATED_EMAIL",
  ACCOUNT_LOCKED: "AUTH_ACCOUNT_LOCKED",
  ACCOUNT_INACTIVE: "AUTH_ACCOUNT_INACTIVE",

  // 비밀번호 정책
  PASSWORD_EXPIRED: "AUTH_PASSWORD_EXPIRED",
  NEED_PASSWORD_CHANGE: "AUTH_NEED_PASSWORD_CHANGE",
  PASSWORD_TOO_WEAK: "AUTH_PASSWORD_TOO_WEAK",
  PASSWORD_RECENTLY_USED: "AUTH_PASSWORD_RECENTLY_USED",

  // 토큰/세션
  TOKEN_EXPIRED: "AUTH_TOKEN_EXPIRED",
  TOKEN_INVALID: "AUTH_TOKEN_INVALID",
  SESSION_EXPIRED: "AUTH_SESSION_EXPIRED",
  REFRESH_TOKEN_EXPIRED: "AUTH_REFRESH_TOKEN_EXPIRED",

  // 본인인증
  VERIFICATION_FAILED: "AUTH_VERIFICATION_FAILED",
  VERIFICATION_EXPIRED: "AUTH_VERIFICATION_EXPIRED",
  UNDER_14: "AUTH_UNDER_14",

  // 약관
  TERMS_REQUIRED: "AUTH_TERMS_REQUIRED",
  TERMS_NOT_AGREED: "AUTH_TERMS_NOT_AGREED",

  // OAuth
  OAUTH_FAILED: "AUTH_OAUTH_FAILED",
  OAUTH_CANCELLED: "AUTH_OAUTH_CANCELLED",
  OAUTH_PROVIDER_ERROR: "AUTH_OAUTH_PROVIDER_ERROR",

  // 기타
  SERVER_ERROR: "AUTH_SERVER_ERROR",
  NETWORK_ERROR: "AUTH_NETWORK_ERROR",
  UNKNOWN_ERROR: "AUTH_UNKNOWN_ERROR",
} as const;

export type AuthErrorCode =
  (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];

/**
 * 에러 코드별 사용자 메시지 맵
 */
export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  // 인증 실패
  [AUTH_ERROR_CODES.INVALID_CREDENTIALS]:
    "아이디 또는 비밀번호가 일치하지 않습니다.",
  [AUTH_ERROR_CODES.USER_NOT_FOUND]: "존재하지 않는 사용자입니다.",
  [AUTH_ERROR_CODES.INVALID_PASSWORD]: "비밀번호가 일치하지 않습니다.",

  // 계정 상태
  [AUTH_ERROR_CODES.DUPLICATED_ACCOUNT]:
    "이미 가입된 계정입니다. 로그인 해주세요.",
  [AUTH_ERROR_CODES.DUPLICATED_PHONE]:
    "이미 사용 중인 전화번호입니다. 다른 번호를 입력해주세요.",
  [AUTH_ERROR_CODES.DUPLICATED_EMAIL]:
    "이미 사용 중인 이메일입니다. 다른 이메일을 입력해주세요.",
  [AUTH_ERROR_CODES.ACCOUNT_LOCKED]:
    "계정이 잠겼습니다. 고객센터로 문의해주세요.",
  [AUTH_ERROR_CODES.ACCOUNT_INACTIVE]:
    "비활성화된 계정입니다. 고객센터로 문의해주세요.",

  // 비밀번호 정책
  [AUTH_ERROR_CODES.PASSWORD_EXPIRED]:
    "비밀번호를 변경한 지 90일이 지났습니다. 비밀번호를 변경해주세요.",
  [AUTH_ERROR_CODES.NEED_PASSWORD_CHANGE]:
    "보안을 위해 비밀번호를 변경해주세요.",
  [AUTH_ERROR_CODES.PASSWORD_TOO_WEAK]:
    "비밀번호가 너무 약합니다. 영문, 숫자, 특수문자를 조합해주세요.",
  [AUTH_ERROR_CODES.PASSWORD_RECENTLY_USED]:
    "최근에 사용한 비밀번호는 사용할 수 없습니다.",

  // 토큰/세션
  [AUTH_ERROR_CODES.TOKEN_EXPIRED]:
    "로그인 정보가 만료되었습니다. 다시 로그인해주세요.",
  [AUTH_ERROR_CODES.TOKEN_INVALID]:
    "로그인 정보가 유효하지 않습니다. 다시 로그인해주세요.",
  [AUTH_ERROR_CODES.SESSION_EXPIRED]:
    "세션이 만료되었습니다. 다시 로그인해주세요.",
  [AUTH_ERROR_CODES.REFRESH_TOKEN_EXPIRED]:
    "로그인 세션이 만료되었습니다. 다시 로그인해주세요.",

  // 본인인증
  [AUTH_ERROR_CODES.VERIFICATION_FAILED]:
    "본인인증에 실패했습니다. 다시 시도해주세요.",
  [AUTH_ERROR_CODES.VERIFICATION_EXPIRED]:
    "본인인증 시간이 만료되었습니다. 다시 시도해주세요.",
  [AUTH_ERROR_CODES.UNDER_14]:
    "만 14세 미만은 가입할 수 없습니다. 법정대리인의 동의가 필요합니다.",

  // 약관
  [AUTH_ERROR_CODES.TERMS_REQUIRED]: "약관 동의가 필요합니다.",
  [AUTH_ERROR_CODES.TERMS_NOT_AGREED]: "필수 약관에 동의해주세요.",

  // OAuth
  [AUTH_ERROR_CODES.OAUTH_FAILED]:
    "소셜 로그인에 실패했습니다. 다시 시도해주세요.",
  [AUTH_ERROR_CODES.OAUTH_CANCELLED]: "로그인이 취소되었습니다.",
  [AUTH_ERROR_CODES.OAUTH_PROVIDER_ERROR]:
    "소셜 로그인 제공사에서 오류가 발생했습니다.",

  // 기타
  [AUTH_ERROR_CODES.SERVER_ERROR]:
    "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  [AUTH_ERROR_CODES.NETWORK_ERROR]:
    "네트워크 연결을 확인해주세요. 인터넷에 연결되어 있는지 확인해주세요.",
  [AUTH_ERROR_CODES.UNKNOWN_ERROR]:
    "알 수 없는 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
};

/**
 * 에러 코드에서 사용자 메시지 추출
 *
 * @param errorCode - 백엔드에서 반환한 에러 코드
 * @param fallbackMessage - 매핑되지 않은 에러 코드일 경우 기본 메시지
 * @returns 사용자에게 표시할 메시지
 */
export function getAuthErrorMessage(
  errorCode: string,
  fallbackMessage?: string
): string {
  // 에러 코드가 AUTH_ERROR_CODES에 정의된 것인지 확인
  if (errorCode in AUTH_ERROR_MESSAGES) {
    return AUTH_ERROR_MESSAGES[errorCode as AuthErrorCode];
  }

  // 매핑되지 않은 에러 코드
  return (
    fallbackMessage || AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.UNKNOWN_ERROR]
  );
}

/**
 * API 에러 응답에서 에러 코드 추출
 *
 * @param error - API 에러 객체
 * @returns 에러 코드 또는 null
 */
export function extractAuthErrorCode(error: unknown): string | null {
  if (!error || typeof error !== "object") {
    return null;
  }

  // ApiError 클래스 인스턴스인 경우
  if ("code" in error && typeof error.code === "string") {
    return error.code;
  }

  // Axios 에러 응답 구조
  if ("response" in error && error.response && typeof error.response === "object") {
    const response = error.response as any;
    if (response.data?.code) {
      return response.data.code;
    }
    if (response.data?.error) {
      return response.data.error;
    }
  }

  return null;
}

/**
 * 에러 객체를 사용자 친화적인 메시지로 변환
 *
 * @param error - API 에러 객체
 * @param fallbackMessage - 기본 메시지
 * @returns 사용자에게 표시할 메시지
 */
export function parseAuthError(
  error: unknown,
  fallbackMessage?: string
): string {
  const errorCode = extractAuthErrorCode(error);

  if (errorCode) {
    return getAuthErrorMessage(errorCode, fallbackMessage);
  }

  // 에러 코드를 추출할 수 없는 경우
  if (error instanceof Error) {
    return error.message || fallbackMessage || AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.UNKNOWN_ERROR];
  }

  return fallbackMessage || AUTH_ERROR_MESSAGES[AUTH_ERROR_CODES.UNKNOWN_ERROR];
}

/**
 * 에러 코드 기반 액션 결정
 *
 * @param errorCode - 에러 코드
 * @returns 수행할 액션 정보
 */
export function getAuthErrorAction(errorCode: string): {
  type: "redirect" | "alert" | "none";
  path?: string;
} {
  switch (errorCode) {
    case AUTH_ERROR_CODES.TOKEN_EXPIRED:
    case AUTH_ERROR_CODES.TOKEN_INVALID:
    case AUTH_ERROR_CODES.SESSION_EXPIRED:
    case AUTH_ERROR_CODES.REFRESH_TOKEN_EXPIRED:
      return { type: "redirect", path: "/login" };

    case AUTH_ERROR_CODES.PASSWORD_EXPIRED:
    case AUTH_ERROR_CODES.NEED_PASSWORD_CHANGE:
      return { type: "redirect", path: "/reset-password" };

    case AUTH_ERROR_CODES.TERMS_REQUIRED:
    case AUTH_ERROR_CODES.TERMS_NOT_AGREED:
      return { type: "redirect", path: "/terms-agreement" };

    case AUTH_ERROR_CODES.UNDER_14:
      return { type: "redirect", path: "/guide/minor" };

    case AUTH_ERROR_CODES.DUPLICATED_ACCOUNT:
      // 중복 계정 정보는 별도 처리 (페이지에서 직접 리다이렉트)
      return { type: "none" };

    default:
      return { type: "alert" };
  }
}
