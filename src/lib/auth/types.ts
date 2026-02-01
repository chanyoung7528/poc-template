import { NextRequest } from 'next/server';
import type { User } from '@prisma/client';

/**
 * OAuth Provider 공통 인터페이스
 */
export interface OAuthProvider {
  name: 'kakao' | 'naver';

  /**
   * 인가 코드로 액세스 토큰 획득 (토큰 정보 포함)
   */
  getAccessToken(code: string, state?: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    tokenType?: string;
    expiresIn?: number;
  }>;

  /**
   * 액세스 토큰으로 사용자 정보 조회
   */
  getUserInfo(accessToken: string): Promise<OAuthUserInfo>;

  /**
   * DB에서 사용자 조회
   */
  findUser(providerId: string): Promise<User | null>;
}

/**
 * OAuth 사용자 정보 (정규화된 형태)
 */
export interface OAuthUserInfo {
  providerId: string; // 제공자의 고유 ID
  email?: string;
  nickname?: string;
  profileImage?: string;
  provider: 'kakao' | 'naver';
  // 소셜 로그인 토큰 정보
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  expiresAt?: Date;
}

/**
 * OAuth 콜백 처리 결과
 */
export interface OAuthCallbackResult {
  success: boolean;
  redirectUrl: string;
  sessionToken?: string;
}

/**
 * 회원가입/로그인 모드
 */
export type AuthMode = 'signup' | 'login';

/**
 * OAuth 콜백 컨텍스트
 */
export interface OAuthCallbackContext {
  request: NextRequest;
  code: string;
  state?: string;
  mode: AuthMode;
  provider: OAuthProvider;
}
