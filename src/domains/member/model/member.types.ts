/**
 * Domain: Member - Types
 * 
 * 역할: 회원 도메인 타입 정의
 * - API 요청/응답 타입
 * - 토큰 타입
 * - 회원 정보 타입
 */

// ============================================
// 토큰 타입
// ============================================

/**
 * Verification Token (인증완료 토큰)
 * 유효기간: 15분
 * 용도: NICE 본인인증 완료 후 일반 회원가입 시 사용
 */
export interface VerificationTokenData {
  token: string;
  expiresAt: number; // timestamp
}

/**
 * Register Token (SNS 간편가입 토큰)
 * 유효기간: 5분
 * 용도: SNS 간편 회원가입 시 SNS 정보를 안전하게 전달
 */
export interface RegisterTokenData {
  token: string;
  snsType: SnsType;
  expiresAt: number;
}

/**
 * Link Token (계정 연동 토큰)
 * 유효기간: 5분
 * 용도: 기존 회원이 다른 로그인 방식을 추가할 때 사용
 */
export interface LinkTokenData {
  token: string;
  userUlid: string;
  expiresAt: number;
}

// ============================================
// 회원 정보
// ============================================

export type SnsType = "KAKAO" | "NAVER" | "APPLE";

export interface Member {
  mbrUlid: string;
  wellnessId?: string; // 일반 로그인 ID
  nickname: string;
  email: string;
  snsType?: SnsType;
  snsId?: string;
  createdAt: string;
}

// ============================================
// API 요청 타입
// ============================================

/**
 * 회원 상태 조회 요청
 */
export interface CheckUserStatusRequest {
  transactionId: string; // NICE 본인인증 거래 ID
}

/**
 * SNS 회원 조회 요청
 */
export interface CheckSnsUserRequest {
  snsType: SnsType;
  snsId: string;
  snsEmail?: string;
}

/**
 * 일반 회원가입 요청
 */
export interface RegisterGeneralRequest {
  verificationToken: string;
  wellnessId: string;
  password: string;
  nickname: string;
  email?: string;
  agreeMarketing: boolean;
}

/**
 * SNS 회원가입 요청
 */
export interface RegisterSnsRequest {
  registerToken: string;
  transactionId: string; // PASS 본인인증 거래 ID
  nickname: string;
  agreeMarketing: boolean;
}

/**
 * 일반 계정 연동 요청
 */
export interface LinkGeneralRequest {
  linkToken: string;
  wellnessId: string;
  password: string;
}

/**
 * SNS 계정 연동 요청
 */
export interface LinkSnsRequest {
  linkToken: string;
  registerToken: string;
}

/**
 * 일반 로그인 요청
 */
export interface LoginGeneralRequest {
  wellnessId: string;
  password: string;
}

/**
 * SNS 로그인 요청
 */
export interface LoginSnsRequest {
  snsType: SnsType;
  snsId: string;
  snsEmail?: string;
}

/**
 * 아이디 찾기 요청
 */
export interface FindLoginInfoRequest {
  transactionId: string;
}

/**
 * 로그인 ID 중복 체크 요청
 */
export interface CheckLoginIdRequest {
  wellnessId: string;
}

/**
 * 비밀번호 재설정 요청
 */
export interface ResetPasswordRequest {
  transactionId: string;
  newPassword: string;
}

/**
 * 약관 동의 저장 요청
 */
export interface SaveAgreementsRequest {
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeMarketing: boolean;
}

// ============================================
// API 응답 타입
// ============================================

/**
 * 회원 상태 조회 응답
 */
export type CheckUserStatusResponse =
  | {
      status: "NEW_USER";
      verificationToken: string;
    }
  | {
      status: "EXISTING_USER";
      member: Member;
    }
  | {
      status: "LINK_REQUIRED";
      linkToken: string;
      existingMember: {
        mbrUlid: string;
        maskedId: string; // 마스킹된 아이디 (예: wel****)
        loginType: "GENERAL" | "SNS";
        snsType?: SnsType;
      };
    };

/**
 * SNS 회원 조회 응답
 */
export type CheckSnsUserResponse =
  | {
      status: "EXISTING_USER";
      member: Member;
    }
  | {
      status: "REGISTER_REQUIRED";
      registerToken: string;
    }
  | {
      status: "LINK_REQUIRED";
      linkToken: string;
      existingMember: {
        mbrUlid: string;
        maskedId: string;
        loginType: "GENERAL" | "SNS";
        snsType?: SnsType;
      };
    };

/**
 * 회원가입/로그인 성공 응답
 */
export interface AuthSuccessResponse {
  member: Member;
  accessToken: string;
  refreshToken: string;
}

/**
 * 아이디 찾기 응답
 */
export interface FindLoginInfoResponse {
  wellnessId: string;
  maskedId: string; // 마스킹된 아이디
  createdAt: string;
}

/**
 * 로그인 ID 중복 체크 응답
 */
export interface CheckLoginIdResponse {
  available: boolean;
  reason?: string; // 사용 불가 사유
}

/**
 * 비밀번호 재설정 응답
 */
export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

/**
 * 약관 동의 저장 응답
 */
export interface SaveAgreementsResponse {
  success: boolean;
}

/**
 * 회원 탈퇴 응답
 */
export interface WithdrawResponse {
  success: boolean;
  message: string;
}

// ============================================
// 에러 코드
// ============================================

export const MEMBER_ERROR_CODES = {
  // 인증 관련
  INVALID_VERIFICATION_TOKEN: "MEMBER_001",
  EXPIRED_VERIFICATION_TOKEN: "MEMBER_002",
  INVALID_REGISTER_TOKEN: "MEMBER_003",
  EXPIRED_REGISTER_TOKEN: "MEMBER_004",
  INVALID_LINK_TOKEN: "MEMBER_005",
  EXPIRED_LINK_TOKEN: "MEMBER_006",

  // 회원가입 관련
  DUPLICATED_WELLNESS_ID: "MEMBER_011",
  DUPLICATED_SNS_USER: "MEMBER_012",
  INVALID_PASSWORD: "MEMBER_013",
  UNDER_AGE: "MEMBER_014",

  // 로그인 관련
  INVALID_CREDENTIALS: "MEMBER_021",
  USER_NOT_FOUND: "MEMBER_022",
  ACCOUNT_LOCKED: "MEMBER_023",
  PASSWORD_EXPIRED: "MEMBER_024",

  // 계정 연동 관련
  ALREADY_LINKED: "MEMBER_031",
  LINK_NOT_ALLOWED: "MEMBER_032",

  // 본인인증 관련
  INVALID_TRANSACTION_ID: "MEMBER_041",
  EXPIRED_TRANSACTION: "MEMBER_042",
  VERIFICATION_FAILED: "MEMBER_043",
} as const;

export type MemberErrorCode =
  (typeof MEMBER_ERROR_CODES)[keyof typeof MEMBER_ERROR_CODES];
