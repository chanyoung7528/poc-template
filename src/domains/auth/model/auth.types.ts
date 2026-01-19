export type AuthProvider = 'kakao' | 'naver' | 'apple';

export type AuthStatus =
  | 'idle'
  | 'loading'
  | 'authenticated'
  | 'unauthenticated'
  | 'error';

export interface User {
  id: string;
  email?: string;
  nickname?: string;
  profileImage?: string;
  provider: AuthProvider;
  connectedAt: string;
}

export interface TempToken {
  token: string;
  expiresAt: number;
}

export interface LoginResponse {
  user: User;
  sessionId: string;
}

export interface SignupData {
  email: string;
  password: string;
  nickname: string;
  termsAgreed: boolean;
  privacyAgreed: boolean;
  isMinor: boolean;
}

export interface ResetPasswordData {
  email: string;
  newPassword: string;
  verificationCode: string;
}

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
