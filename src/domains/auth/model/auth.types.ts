// ==================== 기본 타입 ====================

export type AuthProvider = 'kakao' | 'naver' | 'apple';
export type SnsType = 'KAKAO' | 'NAVER' | 'APPLE';

export type AuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'error';

export interface User {
  id: string;
  ulid: string;
  email?: string;
  nickname?: string;
  profileImage?: string;
  provider: AuthProvider;
  connectedAt: string;
}

// ==================== 토큰 관련 타입 ====================

/**
 * Verification Token (15분)
 * NICE 본인인증 완료 후 일반 회원가입 시 사용
 */
export interface VerificationToken {
  token: string;
  expiresAt: number;
}

/**
 * Register Token (5분)
 * SNS 간편 회원가입 시 SNS 정보를 안전하게 전달
 */
export interface RegisterToken {
  token: string;
  snsType: SnsType;
  expiresAt: number;
}

/**
 * Link Token (5분)
 * 계정 연동 시 사용
 */
export interface LinkToken {
  token: string;
  userUlid: string;
  expiresAt: number;
}

// ==================== API 응답 타입 ====================

/**
 * 사용자 상태 확인 응답
 * (본인인증 후 checkUserStatus API)
 */
export interface CheckUserStatusResponse {
  status: 'NEW_USER' | 'EXISTING_USER' | 'LINK_REQUIRED';
  verificationToken?: string; // 신규 회원인 경우
  linkToken?: string; // 계정 연동 필요한 경우
  existingUser?: {
    ulid: string;
    maskedId: string;
    provider: string; // 이미 가입된 소셜 정보
  };
}

/**
 * SNS 사용자 확인 응답
 * (SNS 로그인 시도 시 checkSnsUser API)
 */
export interface CheckSnsUserResponse {
  status: 'EXISTING' | 'NEW_USER' | 'LINK_REQUIRED';
  user?: {
    ulid: string;
    nickname: string;
  };
  registerToken?: string; // 신규 회원인 경우
  linkToken?: string; // 계정 연동 필요한 경우
  existingUser?: {
    ulid: string;
    maskedId: string;
    provider: string;
  };
}

/**
 * 로그인/회원가입 성공 응답
 */
export interface AuthSuccessResponse {
  success: boolean;
  user: User;
  redirectUrl?: string;
}

// ==================== 요청 데이터 타입 ====================

/**
 * 일반 회원가입 데이터
 */
export interface RegisterGeneralRequest {
  verificationToken: string; // 본인인증 토큰
  wellnessId: string; // 아이디
  password: string;
  termsAgreed: boolean;
  privacyAgreed: boolean;
  marketingAgreed?: boolean;
}

/**
 * SNS 회원가입 데이터
 */
export interface RegisterSnsRequest {
  registerToken: string; // SNS 정보 토큰
  transactionId: string; // NICE 본인인증 거래 ID
  termsAgreed: boolean;
  privacyAgreed: boolean;
  marketingAgreed?: boolean;
}

/**
 * 일반 로그인 계정 연동 데이터
 */
export interface LinkGeneralAccountRequest {
  linkToken: string;
  wellnessId: string;
  password: string;
}

/**
 * SNS 로그인 계정 연동 데이터
 */
export interface LinkSnsAccountRequest {
  linkToken: string;
  registerToken: string;
}

/**
 * 일반 로그인 데이터
 */
export interface LoginGeneralRequest {
  wellnessId: string;
  password: string;
}

// ==================== 본인인증 관련 ====================

export interface CertificationData {
  name: string;
  phone: string;
  birth: string;
  gender: 'M' | 'F';
}

export interface CertificationResult {
  status: 'NEW' | 'EXISTING' | 'UNDER_14';
  certificationData?: CertificationData;
  user?: {
    id: string;
    maskedId: string;
    provider: string;
  };
}

// 아임포트 본인인증 응답 타입
export interface IamportCertificationResponse {
  success: boolean;
  imp_uid?: string;
  merchant_uid?: string;
  error_msg?: string;
  error_code?: string;
}

// 아임포트 SDK 타입 정의
declare global {
  interface Window {
    IMP?: {
      init: (impCode: string) => void;
      certification: (
        data: {
          merchant_uid: string;
          popup?: boolean;
          m_redirect_url?: string;
        },
        callback: (response: IamportCertificationResponse) => void
      ) => void;
    };
  }
}
