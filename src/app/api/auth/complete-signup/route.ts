import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { createKakaoUser, createNaverUser } from '@/lib/database';
import type { SessionUser } from '@/lib/types';
import { createSessionToken, setSessionCookie } from '@/lib/session';

/**
 * 회원가입 완료 API (본인인증 완료 후)
 *
 * 임시 세션 사용자의 본인인증까지 완료되면 DB에 최종 저장
 *
 * POST /api/auth/complete-signup
 */
export async function POST() {
  try {
    // 세션에서 임시 사용자 정보 가져오기
    const sessionUser = await getSessionUser();

    console.log('📋 회원가입 완료 API - 세션 사용자:', {
      id: sessionUser?.id,
      provider: sessionUser?.provider,
      isTemp: sessionUser?.isTemp,
      termsAgreed: sessionUser?.termsAgreed,
      verified: sessionUser?.verified,
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

    // 약관 동의 확인
    if (!sessionUser.termsAgreed) {
      console.error('약관 동의가 필요합니다.');
      return NextResponse.json(
        {
          error: 'terms_required',
          message: '약관 동의가 필요합니다.',
          redirectUrl: '/terms-agreement',
        },
        { status: 400 }
      );
    }

    // 본인인증 확인
    if (!sessionUser.verified) {
      console.error('본인인증이 필요합니다.');
      return NextResponse.json(
        {
          error: 'verification_required',
          message: '본인인증이 필요합니다.',
          redirectUrl: '/verify',
        },
        { status: 400 }
      );
    }

    console.log(
      '✅ 약관 동의 + 본인인증 완료, DB에 사용자 저장 시작:',
      sessionUser.provider
    );

    // Provider에 따라 DB에 사용자 생성
    let newUser;
    if (sessionUser.provider === 'kakao' && sessionUser.kakaoId) {
      newUser = await createKakaoUser({
        kakaoId: sessionUser.kakaoId,
        email: sessionUser.email || null,
        nickname: sessionUser.nickname || null,
        profileImage: sessionUser.profileImage || null,
        marketingAgreed: false, // 약관 동의 정보를 세션에서 가져올 수도 있음
      });
    } else if (sessionUser.provider === 'naver' && sessionUser.naverId) {
      newUser = await createNaverUser({
        naverId: sessionUser.naverId,
        email: sessionUser.email || null,
        nickname: sessionUser.nickname || null,
        profileImage: sessionUser.profileImage || null,
        marketingAgreed: false,
      });
    } else {
      console.error('지원하지 않는 Provider:', sessionUser.provider);
      return NextResponse.json(
        {
          error: 'invalid_provider',
          message: '지원하지 않는 인증 방식입니다.',
        },
        { status: 400 }
      );
    }

    console.log('✅ DB에 사용자 생성 완료:', newUser.id);

    // 정식 세션 토큰 생성 (isTemp 명시적으로 제거)
    const finalSessionUser: SessionUser = {
      id: newUser.id,
      kakaoId: newUser.kakaoId || undefined,
      naverId: newUser.naverId || undefined,
      email: newUser.email || undefined,
      nickname: newUser.nickname || undefined,
      profileImage: newUser.profileImage || undefined,
      provider: sessionUser.provider,
      isTemp: undefined, // 명시적으로 undefined 설정
    };

    console.log('🔄 정식 세션 생성:', {
      id: finalSessionUser.id,
      provider: finalSessionUser.provider,
      isTemp: finalSessionUser.isTemp,
    });

    const finalSessionToken = await createSessionToken(finalSessionUser);
    await setSessionCookie(finalSessionToken);

    console.log('✅ 회원가입 완료 및 로그인:', newUser.id);

    // 성공 응답
    return NextResponse.json({
      success: true,
      userId: newUser.id,
      redirectUrl: '/main',
    });
  } catch (error) {
    console.error('회원가입 완료 처리 중 오류:', error);
    return NextResponse.json(
      { error: 'server_error', message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
