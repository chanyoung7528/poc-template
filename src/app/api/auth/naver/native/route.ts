import { NextRequest, NextResponse } from 'next/server';
import { handleLoginFlow } from '@/lib/auth/login-handler';
import { handleSignupFlow } from '@/lib/auth/signup-handler';
import { findUserByNaverId, findUserByEmail } from '@/lib/database';
import type { OAuthUserInfo } from '@/lib/auth/types';

/**
 * 네이티브 앱에서 받은 네이버 로그인 데이터 처리
 *
 * POST /api/auth/naver/native
 * Body: {
 *   id: string;           // 네이버 사용자 ID
 *   nickname?: string;
 *   email?: string;
 *   profileImage?: string;
 *   cid?: string;         // 사용자 ID (id와 동일)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, nickname, email, profileImage, cid } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'invalid_request', message: '네이버 사용자 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // OAuthUserInfo 형태로 변환
    const userInfo: OAuthUserInfo = {
      providerId: id,
      email: email || undefined,
      nickname: nickname || undefined,
      profileImage: profileImage || undefined,
      provider: 'naver',
    };

    console.log('📱 네이티브 네이버 로그인 요청:', {
      providerId: userInfo.providerId,
      email: userInfo.email,
      nickname: userInfo.nickname,
    });

    // DB에서 사용자 조회
    let existingUser;
    try {
      existingUser = await findUserByNaverId(userInfo.providerId);
    } catch (dbError) {
      console.error('데이터베이스 조회 오류:', dbError);
      return NextResponse.json(
        { error: 'db_error', message: '사용자 조회 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    // 이메일로 다른 플랫폼 가입 확인 (신규 사용자인 경우)
    if (!existingUser && userInfo.email) {
      try {
        const emailUser = await findUserByEmail(userInfo.email);
        if (emailUser) {
          console.error(
            '❌ 이미 다른 플랫폼으로 가입된 이메일:',
            userInfo.email,
            emailUser.provider
          );
          return NextResponse.json(
            {
              error: 'already_registered',
              message: '이미 다른 방법으로 가입된 이메일입니다.',
              provider: emailUser.provider,
            },
            { status: 400 }
          );
        }
      } catch (error) {
        console.error('이메일 조회 오류:', error);
      }
    }

    // 로그인 또는 회원가입 플로우 처리
    const result = existingUser
      ? await handleLoginFlow(userInfo, existingUser)
      : await handleSignupFlow(userInfo, existingUser);

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error || 'unknown_error',
          message: '로그인 처리 중 오류가 발생했습니다.',
          redirectUrl: result.redirectUrl,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      redirectUrl: result.redirectUrl,
      isNewUser: !existingUser,
    });
  } catch (err) {
    console.error('네이버 네이티브 로그인 처리 중 오류:', err);
    return NextResponse.json(
      {
        error: 'server_error',
        message: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}

