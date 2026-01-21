import type { SessionUser } from '@/lib/types';
import { updateUser, updateLastLogin } from '@/lib/database';
import type { OAuthUserInfo } from './types';
import { handleSignupFlow } from './signup-handler';
import type { User } from '@prisma/client';

/**
 * 로그인 처리 결과
 */
export interface LoginResult {
  success: boolean;
  redirectUrl: string;
  error?: string;
  sessionUser?: SessionUser;
}

/**
 * 로그인 플로우 처리
 * 1. 가입되지 않은 사용자: 임시 세션 생성 후 약관 동의 페이지로 이동
 * 2. 기존 사용자: 프로필 업데이트 후 로그인
 * 3. 세션 토큰 생성 후 메인 페이지로 리다이렉트
 */
export async function handleLoginFlow(
  userInfo: OAuthUserInfo,
  existingUser: User | null
): Promise<LoginResult> {
  // 가입되지 않은 사용자 → 회원가입 플로우로 처리
  // 인증 데이터를 임시 세션에 저장하고 약관 동의 페이지로 이동
  if (!existingUser) {
    console.log(
      '🆕 미가입 사용자 - 회원가입 플로우로 전환:',
      userInfo.providerId
    );
    return await handleSignupFlow(userInfo, existingUser);
  }

  console.log('🔄 기존 회원 로그인:', existingUser.id);

  // 프로필 정보 업데이트 (변경되었을 수 있음)
  try {
    await updateUser(existingUser.id, {
      email: userInfo.email || existingUser.email,
      nickname: userInfo.nickname || existingUser.nickname,
      profileImage: userInfo.profileImage || existingUser.profileImage,
    });

    // 마지막 로그인 시간 업데이트
    await updateLastLogin(existingUser.id);
  } catch (error) {
    console.error('사용자 업데이트 오류:', error);
    // 업데이트 실패해도 로그인은 진행
  }

  // 세션 사용자 생성
  const sessionUser: SessionUser = {
    id: existingUser.id,
    [userInfo.provider === 'kakao' ? 'kakaoId' : 'naverId']:
      existingUser[userInfo.provider === 'kakao' ? 'kakaoId' : 'naverId'],
    email: existingUser.email || undefined,
    nickname: existingUser.nickname || undefined,
    profileImage: existingUser.profileImage || undefined,
    provider: userInfo.provider,
  };

  console.log('✅ 로그인 성공:', existingUser.id);

  return {
    success: true,
    redirectUrl: '/terms-agreement',
    sessionUser,
  };
}
