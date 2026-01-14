export type AuthProvider = 'kakao' | 'naver' | 'apple';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';

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
