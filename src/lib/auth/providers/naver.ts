import { env } from '@/lib/config';
import type { NaverTokenResponse, NaverUserInfo } from '@/lib/types';
import { findUserByNaverId } from '@/lib/database';
import type { OAuthProvider, OAuthUserInfo } from '../types';
import type { User } from '@prisma/client';

/**
 * 네이버 OAuth Provider 구현
 */
export class NaverProvider implements OAuthProvider {
  name = 'naver' as const;

  /**
   * 인가 코드로 액세스 토큰 획득
   */
  async getAccessToken(code: string, state: string): Promise<string> {
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: env.naver.clientId,
      client_secret: env.naver.clientSecret,
      code,
      state,
    });

    const response = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('네이버 토큰 요청 실패:', errorData);
      throw new Error('네이버 토큰 요청 실패');
    }

    const tokenData: NaverTokenResponse = await response.json();
    return tokenData.access_token;
  }

  /**
   * 액세스 토큰으로 사용자 정보 조회
   */
  async getUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    const response = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('네이버 유저 정보 요청 실패');
      throw new Error('네이버 유저 정보 요청 실패');
    }

    const naverUser: NaverUserInfo = await response.json();

    if (naverUser.resultcode !== '00') {
      console.error('네이버 사용자 정보 조회 실패:', naverUser.message);
      throw new Error('네이버 사용자 정보 조회 실패');
    }

    return {
      providerId: naverUser.response.id,
      email: naverUser.response.email,
      nickname: naverUser.response.nickname || naverUser.response.name,
      profileImage: naverUser.response.profile_image,
      provider: 'naver',
    };
  }

  /**
   * DB에서 사용자 조회
   */
  async findUser(providerId: string): Promise<User | null> {
    return await findUserByNaverId(providerId);
  }
}
