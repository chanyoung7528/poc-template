// Prisma가 자동 생성한 User 타입을 사용하세요!
// import type { User } from '@prisma/client';

// 카카오 API 응답 타입
export interface KakaoTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  refresh_token_expires_in: number;
}

export interface KakaoUserInfo {
  id: number;
  connected_at: string;
  kakao_account?: {
    profile?: {
      nickname?: string;
      profile_image_url?: string;
      thumbnail_image_url?: string;
    };
    email?: string;
    email_verified?: boolean;
    name?: string;
  };
}

// 네이버 API 응답 타입
export interface NaverTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface NaverUserInfo {
  resultcode: string;
  message: string;
  response: {
    id: string;
    email?: string;
    name?: string;
    nickname?: string;
    profile_image?: string;
    age?: string;
    gender?: string;
    birthday?: string;
    birthyear?: string;
    mobile?: string;
  };
}

// 세션 사용자 타입 (JWT에 저장될 정보)
export interface SessionUser {
  id: string;                    // 우리 서비스의 사용자 ID
  kakaoId?: string;              // 카카오 ID (optional)
  naverId?: string;              // 네이버 ID (optional)
  email?: string;
  nickname?: string;
  profileImage?: string;
  provider: 'kakao' | 'naver';
  isTemp?: boolean;              // 임시 사용자 여부 (DB 저장 전)
  termsAgreed?: boolean;         // 약관 동의 완료 여부
  verified?: boolean;            // 본인인증 완료 여부
}
