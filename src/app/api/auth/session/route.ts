import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';

/**
 * 현재 세션 정보 조회 API
 *
 * GET /api/auth/session
 */
export async function GET() {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: sessionUser.id,
        provider: sessionUser.provider,
        email: sessionUser.email,
        nickname: sessionUser.nickname,
        profileImage: sessionUser.profileImage,
        isTemp: sessionUser.isTemp,
        termsAgreed: sessionUser.termsAgreed,
        verified: sessionUser.verified,
        signupType: sessionUser.signupType,
      },
    });
  } catch (error) {
    console.error('세션 조회 중 오류:', error);
    return NextResponse.json(
      { error: 'server_error', message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
