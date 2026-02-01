import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import type { SessionUser } from '@/lib/types';
import { createSessionToken, setSessionCookie } from '@/lib/session';

/**
 * 약관 동의 업데이트 API
 *
 * 임시 세션 사용자의 약관 동의 상태를 업데이트
 *
 * POST /api/auth/update-terms
 * Body: {
 *   termsAgreed: boolean,
 *   privacyAgreed: boolean,
 *   marketingAgreed: boolean
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 세션에서 임시 사용자 정보 가져오기
    const sessionUser = await getSessionUser();

    console.log('📋 약관 동의 업데이트 - 세션 사용자:', {
      id: sessionUser?.id,
      provider: sessionUser?.provider,
      isTemp: sessionUser?.isTemp,
    });

    if (!sessionUser) {
      console.error('세션이 없습니다.');
      return NextResponse.json(
        { error: 'unauthorized', message: '인증 정보가 없습니다.' },
        { status: 401 }
      );
    }

    // 임시 사용자가 아니면 이미 가입된 사용자
    if (!sessionUser.isTemp) {
      console.error('이미 가입된 사용자입니다:', sessionUser.id);
      return NextResponse.json(
        { error: 'already_registered', message: '이미 가입된 사용자입니다.' },
        { status: 400 }
      );
    }

    // 요청 바디에서 약관 동의 정보 추출
    const body = await request.json();
    const { termsAgreed, privacyAgreed, marketingAgreed } = body;

    // 필수 약관 확인
    if (!termsAgreed || !privacyAgreed) {
      console.error('필수 약관에 동의하지 않았습니다.');
      return NextResponse.json(
        { error: 'terms_required', message: '필수 약관에 동의해주세요.' },
        { status: 400 }
      );
    }

    console.log('✅ 약관 동의 완료, 세션 업데이트');

    // 약관 동의 상태를 세션에 추가 (✅ 토큰 정보 유지)
    const updatedUser: SessionUser = {
      ...sessionUser,
      termsAgreed: true,
      // marketingAgreed 정보도 필요하면 추가
      // ✅ 토큰 정보 명시적으로 유지
      accessToken: sessionUser.accessToken,
      refreshToken: sessionUser.refreshToken,
      tokenType: sessionUser.tokenType,
      expiresAt: sessionUser.expiresAt,
    };

    // 업데이트된 세션 토큰 생성
    const updatedToken = await createSessionToken(updatedUser);
    await setSessionCookie(updatedToken);

    console.log('✅ 약관 동의 상태 세션에 저장 완료');

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: '약관 동의가 완료되었습니다.',
      nextStep: '/verify',
    });
  } catch (error) {
    console.error('약관 동의 업데이트 중 오류:', error);
    return NextResponse.json(
      { error: 'server_error', message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
