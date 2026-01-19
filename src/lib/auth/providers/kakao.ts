import { env } from '@/lib/config';
import type { KakaoTokenResponse, KakaoUserInfo } from '@/lib/types';
import { findUserByKakaoId } from '@/lib/database';
import type { OAuthProvider, OAuthUserInfo } from '../types';
import type { User } from '@prisma/client';

/**
 * 카카오 OAuth Provider 구현
 */
export class KakaoProvider implements OAuthProvider {
  name = 'kakao' as const;

  /**
   * 인가 코드로 액세스 토큰 획득
   */
  async getAccessToken(code: string): Promise<string> {
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: env.kakao.clientId,
      client_secret: env.kakao.clientSecret,
      redirect_uri: env.kakao.redirectUri,
      code,
    });

    const response = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('카카오 토큰 요청 실패:', errorData);
      throw new Error('카카오 토큰 요청 실패');
    }

    const tokenData: KakaoTokenResponse = await response.json();
    return tokenData.access_token;
  }

  /**
   * 액세스 토큰으로 사용자 정보 조회
   */
  async getUserInfo(accessToken: string): Promise<OAuthUserInfo> {
    const response = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });

    if (!response.ok) {
      console.error('카카오 유저 정보 요청 실패');
      throw new Error('카카오 유저 정보 요청 실패');
    }

    const kakaoUser: KakaoUserInfo = await response.json();

    return {
      providerId: kakaoUser.id.toString(),
      email: kakaoUser.kakao_account?.email,
      nickname: kakaoUser.kakao_account?.profile?.nickname,
      profileImage: kakaoUser.kakao_account?.profile?.profile_image_url,
      provider: 'kakao',
    };
  }

  /**
   * DB에서 사용자 조회
   */
  async findUser(providerId: string): Promise<User | null> {
    return await findUserByKakaoId(providerId);
  }
}
