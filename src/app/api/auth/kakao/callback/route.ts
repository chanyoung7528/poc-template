import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/config';
import type { KakaoTokenResponse, KakaoUserInfo, SessionUser } from '@/lib/types';
import { createSessionToken, setSessionCookie } from '@/lib/session';
import { findUserByKakaoId, createKakaoUser, updateLastLogin, updateUser, findUserByEmail } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // 에러 처리 (사용자가 취소한 경우)
    if (error) {
      console.error('카카오 인증 에러:', error);
      return NextResponse.redirect(new URL('/login?error=kakao_auth_failed', request.url));
    }

    // 인가 코드 확인
    if (!code) {
      console.error('인가 코드가 없습니다.');
      return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    // ============================================
    // Step 1: 카카오 인가 코드 → Access Token
    // ============================================
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: env.kakao.clientId,
      client_secret: env.kakao.clientSecret,
      redirect_uri: env.kakao.redirectUri,
      code,
    });

    const tokenResponse = await fetch('https://kauth.kakao.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams.toString(),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('카카오 토큰 요청 실패:', errorData);
      return NextResponse.redirect(new URL('/login?error=token_failed', request.url));
    }

    const tokenData: KakaoTokenResponse = await tokenResponse.json();

    // ============================================
    // Step 2: Access Token → 카카오 사용자 정보 조회
    // ============================================
    const userInfoResponse = await fetch('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
      },
    });

    if (!userInfoResponse.ok) {
      console.error('카카오 유저 정보 요청 실패');
      return NextResponse.redirect(new URL('/login?error=userinfo_failed', request.url));
    }

    const kakaoUser: KakaoUserInfo = await userInfoResponse.json();
    const kakaoId = kakaoUser.id.toString();

    console.log('카카오 사용자 정보:', {
      kakaoId,
      email: kakaoUser.kakao_account?.email,
      nickname: kakaoUser.kakao_account?.profile?.nickname,
    });

    // ============================================
    // Step 3: DB에서 사용자 조회 또는 생성
    // ============================================
    let user = await findUserByKakaoId(kakaoId);

    if (!user) {
      // 이메일이 있는 경우, 다른 플랫폼으로 이미 가입했는지 확인
      const email = kakaoUser.kakao_account?.email;
      if (email) {
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
          console.error('❌ 이미 다른 플랫폼으로 가입된 이메일:', email, existingUser.provider);
          return NextResponse.redirect(new URL(`/login?error=already_registered&provider=${existingUser.provider}`, request.url));
        }
      }

      // 🆕 신규 회원: DB에 저장
      console.log('🆕 신규 회원 가입 시작:', kakaoId);

      user = await createKakaoUser({
        kakaoId,
        email: email || null,
        nickname: kakaoUser.kakao_account?.profile?.nickname || null,
        profileImage: kakaoUser.kakao_account?.profile?.profile_image_url || null,
      });

      console.log('✅ 신규 회원 가입 완료:', user.id);
    } else {
      // 🔄 기존 회원: 로그인 처리
      console.log('🔄 기존 회원 로그인:', user.id);

      // 프로필 정보가 변경되었을 수 있으므로 업데이트
      await updateUser(user.id, {
        email: kakaoUser.kakao_account?.email || user.email,
        nickname: kakaoUser.kakao_account?.profile?.nickname || user.nickname,
        profileImage: kakaoUser.kakao_account?.profile?.profile_image_url || user.profileImage,
      });

      // 마지막 로그인 시간 업데이트
      await updateLastLogin(user.id);
    }

    // ============================================
    // Step 4: JWT 세션 토큰 생성
    // ============================================
    const sessionUser: SessionUser = {
      id: user.id, // 우리 서비스의 사용자 ID
      kakaoId: user.kakaoId || undefined, // 카카오 ID
      email: user.email || undefined,
      nickname: user.nickname || undefined,
      profileImage: user.profileImage || undefined,
      provider: 'kakao',
    };

    const sessionToken = await createSessionToken(sessionUser);

    // ============================================
    // Step 5: 세션 쿠키 설정
    // ============================================
    await setSessionCookie(sessionToken);

    console.log('✅ 로그인 성공:', user.id);

    // ============================================
    // Step 6: 로그인 성공 - 메인 페이지로 리다이렉트
    // ============================================
    return NextResponse.redirect(new URL('/', request.url));
  } catch (error) {
    console.error('카카오 로그인 처리 중 오류:', error);
    return NextResponse.redirect(new URL('/login?error=server_error', request.url));
  }
}
