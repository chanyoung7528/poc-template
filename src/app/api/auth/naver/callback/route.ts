import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/config';
import type { NaverTokenResponse, NaverUserInfo, SessionUser } from '@/lib/types';
import { createSessionToken, setSessionCookie } from '@/lib/session';
import { findUserByNaverId, createNaverUser, updateLastLogin, updateUser, findUserByEmail } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    console.log('네이버 콜백 요청:', { code, state, error });
    // 에러 처리 (사용자가 취소한 경우)
    if (error) {
      console.error('네이버 인증 에러:', error);
      return NextResponse.redirect(new URL('/login?error=naver_auth_failed', request.url));
    }

    // 인가 코드 확인
    if (!code || !state) {
      console.error('인가 코드 또는 state가 없습니다.');
      return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    // ============================================
    // Step 1: 네이버 인가 코드 → Access Token
    // ============================================
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: env.naver.clientId,
      client_secret: env.naver.clientSecret,
      code,
      state,
    });

    const tokenResponse = await fetch('https://nid.naver.com/oauth2.0/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams.toString(),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('네이버 토큰 요청 실패:', errorData);
      return NextResponse.redirect(new URL('/login?error=token_failed', request.url));
    }

    const tokenData: NaverTokenResponse = await tokenResponse.json();

    // ============================================
    // Step 2: Access Token → 네이버 사용자 정보 조회
    // ============================================
    const userInfoResponse = await fetch('https://openapi.naver.com/v1/nid/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      console.error('네이버 유저 정보 요청 실패');
      return NextResponse.redirect(new URL('/login?error=userinfo_failed', request.url));
    }

    const naverUser: NaverUserInfo = await userInfoResponse.json();

    if (naverUser.resultcode !== '00') {
      console.error('네이버 사용자 정보 조회 실패:', naverUser.message);
      return NextResponse.redirect(new URL('/login?error=userinfo_failed', request.url));
    }

    const naverId = naverUser.response.id;
    const email = naverUser.response.email;

    console.log('네이버 사용자 정보:', {
      naverId,
      email,
      nickname: naverUser.response.nickname,
    });

    // ============================================
    // Step 3: DB에서 사용자 조회 또는 생성
    // ============================================
    let user = await findUserByNaverId(naverId);

    if (!user) {
      // 이메일이 있는 경우, 다른 플랫폼으로 이미 가입했는지 확인
      if (email) {
        const existingUser = await findUserByEmail(email);
        if (existingUser) {
          console.error('❌ 이미 다른 플랫폼으로 가입된 이메일:', email, existingUser.provider);
          return NextResponse.redirect(new URL(`/login?error=already_registered&provider=${existingUser.provider}`, request.url));
        }
      }

      // 🆕 신규 회원: DB에 저장
      console.log('🆕 신규 회원 가입 시작:', naverId);

      user = await createNaverUser({
        naverId,
        email: email || null,
        nickname: naverUser.response.nickname || naverUser.response.name || null,
        profileImage: naverUser.response.profile_image || null,
      });

      console.log('✅ 신규 회원 가입 완료:', user.id);
    } else {
      // 🔄 기존 회원: 로그인 처리
      console.log('🔄 기존 회원 로그인:', user.id);

      // 프로필 정보가 변경되었을 수 있으므로 업데이트
      await updateUser(user.id, {
        email: email || user.email,
        nickname: naverUser.response.nickname || naverUser.response.name || user.nickname,
        profileImage: naverUser.response.profile_image || user.profileImage,
      });

      // 마지막 로그인 시간 업데이트
      await updateLastLogin(user.id);
    }

    // ============================================
    // Step 4: JWT 세션 토큰 생성
    // ============================================
    const sessionUser: SessionUser = {
      id: user.id, // 우리 서비스의 사용자 ID
      naverId: user.naverId || undefined, // 네이버 ID
      email: user.email || undefined,
      nickname: user.nickname || undefined,
      profileImage: user.profileImage || undefined,
      provider: 'naver',
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
    console.error('네이버 로그인 처리 중 오류:', error);
    return NextResponse.redirect(new URL('/login?error=server_error', request.url));
  }
}
