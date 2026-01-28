/**
 * Domain: Member - Error Handling
 * 
 * 역할: 에러 코드 정의 및 메시지 매핑
 */

import { MEMBER_ERROR_CODES, type MemberErrorCode } from "./member.types";

/**
 * 에러 메시지 매핑
 */
export const MEMBER_ERROR_MESSAGES: Record<MemberErrorCode, string> = {
  // 인증 관련
  [MEMBER_ERROR_CODES.INVALID_VERIFICATION_TOKEN]: "인증 토큰이 유효하지 않습니다",
  [MEMBER_ERROR_CODES.EXPIRED_VERIFICATION_TOKEN]:
    "인증 토큰이 만료되었습니다. 다시 인증해주세요 (15분)",
  [MEMBER_ERROR_CODES.INVALID_REGISTER_TOKEN]: "가입 토큰이 유효하지 않습니다",
  [MEMBER_ERROR_CODES.EXPIRED_REGISTER_TOKEN]:
    "가입 토큰이 만료되었습니다. 다시 시도해주세요 (5분)",
  [MEMBER_ERROR_CODES.INVALID_LINK_TOKEN]: "연동 토큰이 유효하지 않습니다",
  [MEMBER_ERROR_CODES.EXPIRED_LINK_TOKEN]:
    "연동 토큰이 만료되었습니다. 다시 시도해주세요 (5분)",

  // 회원가입 관련
  [MEMBER_ERROR_CODES.DUPLICATED_WELLNESS_ID]:
    "이미 사용 중인 아이디입니다",
  [MEMBER_ERROR_CODES.DUPLICATED_SNS_USER]: "이미 가입된 SNS 계정입니다",
  [MEMBER_ERROR_CODES.INVALID_PASSWORD]:
    "비밀번호는 영문, 숫자 조합 8자 이상이어야 합니다",
  [MEMBER_ERROR_CODES.UNDER_AGE]: "만 14세 미만은 가입할 수 없습니다",

  // 로그인 관련
  [MEMBER_ERROR_CODES.INVALID_CREDENTIALS]:
    "아이디 또는 비밀번호가 일치하지 않습니다",
  [MEMBER_ERROR_CODES.USER_NOT_FOUND]: "존재하지 않는 회원입니다",
  [MEMBER_ERROR_CODES.ACCOUNT_LOCKED]:
    "계정이 잠겼습니다. 고객센터로 문의해주세요",
  [MEMBER_ERROR_CODES.PASSWORD_EXPIRED]:
    "비밀번호 변경이 필요합니다 (90일 경과)",

  // 계정 연동 관련
  [MEMBER_ERROR_CODES.ALREADY_LINKED]: "이미 연동된 계정입니다",
  [MEMBER_ERROR_CODES.LINK_NOT_ALLOWED]: "계정 연동이 불가능합니다",

  // 본인인증 관련
  [MEMBER_ERROR_CODES.INVALID_TRANSACTION_ID]:
    "본인인증 정보가 유효하지 않습니다",
  [MEMBER_ERROR_CODES.EXPIRED_TRANSACTION]:
    "본인인증 정보가 만료되었습니다. 다시 인증해주세요",
  [MEMBER_ERROR_CODES.VERIFICATION_FAILED]: "본인인증에 실패했습니다",
};

/**
 * API 에러에서 에러 코드 추출
 */
export function parseMemberError(error: unknown): {
  code: string;
  message: string;
} {
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response
  ) {
    const response = error.response as {
      data?: { code?: string; message?: string };
    };

    if (response.data?.code) {
      const code = response.data.code;
      const message =
        MEMBER_ERROR_MESSAGES[code as MemberErrorCode] ||
        response.data.message ||
        "알 수 없는 오류가 발생했습니다";

      return { code, message };
    }
  }

  return {
    code: "UNKNOWN",
    message: "알 수 없는 오류가 발생했습니다",
  };
}
