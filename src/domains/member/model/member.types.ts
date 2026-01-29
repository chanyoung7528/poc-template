/**
 * Domain: Member - Types
 *
 * 역할: 회원 도메인 타입 정의 (비즈니스 로직 변경)
 */

// ============================================
// 회원 정보
// ============================================

export interface Member {
  mbrUlid: string;
  oppbId: string; // 공개 ID
}

// ============================================
// 토큰 타입 (FE에서 관리)
// ============================================

export interface VerificationToken {
  token: string;
  expiresAt: number; // 15분
}

export interface RegisterToken {
  token: string;
  expiresAt: number; // 5분
}

export interface LinkToken {
  token: string;
  userUlid: string;
  expiresAt: number; // 5분
}

// ============================================
// 약관 동의
// ============================================

export interface Agreement {
  agrmNo: string;
  agrYn: "Y" | "N";
}

// ============================================
// 회원가입 데이터 (Store에서 관리)
// ============================================

export interface GeneralSignupData {
  // 약관 동의 (terms-agreement 페이지)
  agreements: Agreement[];

  // 본인인증 (verify 페이지)
  verificationToken: string;

  // 회원가입 폼 (credentials 페이지)
  loginId: string;
  password: string;

  // 추가 정보 (선택)
  hegtVal?: number; // 키
  wegtVal?: number; // 몸무게
  actAmountCd?: string; // 활동량 코드

  // 디바이스 정보
  pushTknCont?: string;
  dvcId?: string;
  dvcTpCd?: string; // "AND" | "IOS"
  dvcMdlNm?: string;
  osVerNm?: string;
  appVerNm?: string;
}

export interface SnsSignupData {
  // SNS 정보
  snsType: "KAKAO" | "NAVER" | "APPLE";
  accessToken: string;

  // 약관 동의
  agreements: Agreement[];

  // 본인인증
  registerToken: string;
  transactionId: string;

  // 추가 정보
  hegtVal?: number;
  wegtVal?: number;
  actAmountCd?: string;
}

// ============================================
// API 요청 타입
// ============================================

export interface CheckUserStatusRequest {
  transactionId: string;
}

export type CheckUserStatus = "new" | "duplicate" | "link_required";

/**
 * checkUserStatus API의 data 필드 타입
 */
export interface CheckUserStatusData {
  status: CheckUserStatus;
  verificationToken?: string;
  linkToken?: string | null;
  message?: string;
}

export interface CheckSnsUserRequest {
  snsType: "KAKAO" | "NAVER" | "APPLE";
  accessToken: string;
}

/**
 * checkSnsUser API의 data 필드 타입
 */
export interface CheckSnsUserData {
  status: CheckUserStatus;
  registerToken?: string;
  linkToken?: string | null;
  message?: string;
}

export interface RegisterGeneralRequest {
  verificationToken: string;
  loginId: string;
  password: string;
  agreements: Agreement[];
  hegtVal?: number;
  wegtVal?: number;
  actAmountCd?: string;
  pushTknCont?: string;
  dvcId?: string;
  dvcTpCd?: string;
  dvcMdlNm?: string;
  osVerNm?: string;
  appVerNm?: string;
}

/**
 * registerGeneral API의 data 필드 타입
 */
export interface RegisterGeneralData {
  tokens: {
    // 실제로는 HTTP-only 쿠키로 설정됨
    accessToken?: string;
    refreshToken?: string;
  };
  mbrUlid: string;
  oppbId: string;
}

export interface RegisterSnsUserRequest {
  registerToken: string;
  transactionId: string;
  agreements: Agreement[];
  hegtVal?: number;
  wegtVal?: number;
  actAmountCd?: string;
}

/**
 * registerSnsUser API의 data 필드 타입
 */
export interface RegisterSnsUserData {
  tokens: {
    accessToken?: string;
    refreshToken?: string;
  };
  mbrUlid: string;
  oppbId: string;
}

// ============================================
// 로그인 관련
// ============================================

export interface LoginGeneralRequest {
  loginId: string;
  password: string;
}

/**
 * loginGeneral API의 data 필드 타입
 */
export interface LoginGeneralData {
  mbrUlid: string;
  oppbId: string;
}

// ============================================
// 로그인 ID 중복 체크
// ============================================

export interface CheckLoginIdRequest {
  loginId: string;
}

/**
 * checkLoginId API의 data 필드 타입
 */
export interface CheckLoginIdData {
  available: boolean;
  message: string;
}
