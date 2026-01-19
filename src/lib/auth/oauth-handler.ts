import { NextRequest, NextResponse } from 'next/server';
import type { OAuthProvider, AuthMode } from './types';
import { handleSignupFlow } from './signup-handler';
import { handleLoginFlow } from './login-handler';
import { getSessionUser } from '@/lib/session';
import { createKakaoUser, createNaverUser } from '@/lib/database';
import type { SessionUser } from '@/lib/types';
import { createSessionToken, setSessionCookie } from '@/lib/session';

/**
 * OAuth 콜백 요청에서 모드 추출
 */
export function extractAuthMode(searchParams: URLSearchParams): AuthMode {
  const state = searchParams.get('state');
  if (!state) return 'login';

  try {
    const stateData = JSON?.parse?.(decodeURIComponent(state));
    return stateData.mode || 'login';
  } catch (e) {
    console.error('state 파싱 실패:', e);
    return 'login';
  }
}

/**
 * 에러 응답 생성
 */
export function createErrorResponse(
  request: NextRequest,
  mode: AuthMode,
  error: string
): NextResponse {
  const redirectUrl = mode === 'signup' ? '/signup' : '/login';
  return NextResponse.redirect(
    new URL(`${redirectUrl}?error=${error}`, request.url)
  );
}

/**
 * OAuth 콜백 처리 (공통 로직)
 *
 * 이 함수는 모든 OAuth Provider의 콜백을 통합 처리합니다:
 * 1. 인가 코드 검증
 * 2. 액세스 토큰 획득
 * 3. 사용자 정보 조회
 * 4. DB 조회
 * 5. 모드에 따라 회원가입 또는 로그인 처리
 */
export async function handleOAuthCallback(
  request: NextRequest,
  provider: OAuthProvider
): Promise<NextResponse> {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');
  const mode = extractAuthMode(searchParams);

  console.log(`${provider.name} 콜백 모드:`, mode);

  // 에러 처리 (사용자가 취소한 경우)
  if (error) {
    console.error(`${provider.name} 인증 에러:`, error);
    return createErrorResponse(request, mode, `${provider.name}_auth_failed`);
  }

  // 인가 코드 확인
  if (!code) {
    console.error('인가 코드가 없습니다.');
    return createErrorResponse(request, mode, 'no_code');
  }

  // 네이버는 state가 필수
  if (provider.name === 'naver' && !state) {
    console.error('state가 없습니다.');
    return createErrorResponse(request, mode, 'no_state');
  }

  try {
    // Step 0: 기존 세션 확인 (회원가입 중단 시 이어서 진행)
    const existingSession = await getSessionUser();
    console.log('기존 세션 확인:', {
      exists: !!existingSession,
      provider: existingSession?.provider,
      currentProvider: provider.name,
      isTemp: existingSession?.isTemp,
      termsAgreed: existingSession?.termsAgreed,
      verified: existingSession?.verified,
    });

    // 임시 사용자 세션이 있고, 같은 provider인 경우에만 기존 세션 사용
    if (
      existingSession &&
      existingSession.isTemp &&
      existingSession.provider === provider.name
    ) {
      console.log('⚠️ 회원가입 진행 중인 세션 발견 (같은 Provider)');

      // 본인인증까지 완료했으면 최종 회원가입 처리 (내부에서 직접 처리)
      if (existingSession.termsAgreed && existingSession.verified) {
        console.log('→ 본인인증 완료, 회원가입 최종 처리');

        // DB에 사용자 저장
        let newUser;
        if (existingSession.provider === 'kakao' && existingSession.kakaoId) {
          newUser = await createKakaoUser({
            kakaoId: existingSession.kakaoId,
            email: existingSession.email || null,
            nickname: existingSession.nickname || null,
            profileImage: existingSession.profileImage || null,
            marketingAgreed: false,
          });
        } else if (
          existingSession.provider === 'naver' &&
          existingSession.naverId
        ) {
          newUser = await createNaverUser({
            naverId: existingSession.naverId,
            email: existingSession.email || null,
            nickname: existingSession.nickname || null,
            profileImage: existingSession.profileImage || null,
            marketingAgreed: false,
          });
        } else {
          console.error('유효하지 않은 Provider:', existingSession.provider);
          return NextResponse.redirect(
            new URL('/signup?error=invalid_provider', request.url)
          );
        }

        // 정식 세션 생성
        const finalSessionUser: SessionUser = {
          id: newUser.id,
          kakaoId: newUser.kakaoId || undefined,
          naverId: newUser.naverId || undefined,
          email: newUser.email || undefined,
          nickname: newUser.nickname || undefined,
          profileImage: newUser.profileImage || undefined,
          provider: existingSession.provider,
        };

        const finalSessionToken = await createSessionToken(finalSessionUser);
        await setSessionCookie(finalSessionToken);

        console.log('✅ 회원가입 완료:', newUser.id);

        // 메인 페이지로 직접 리다이렉트 (중간 API 거치지 않음)
        return NextResponse.redirect(new URL('/main', request.url));
      }
      // 약관 동의만 했으면 본인인증으로
      else if (existingSession.termsAgreed && !existingSession.verified) {
        console.log('→ 약관 동의 완료, 본인인증 페이지로 이동');
        return NextResponse.redirect(new URL('/verify', request.url));
      }
      // 약관 동의도 안 했으면 약관 동의로
      else {
        console.log('→ 약관 동의 페이지로 이동');
        return NextResponse.redirect(new URL('/terms-agreement', request.url));
      }
    }

    // 기존 세션이 있지만 다른 provider인 경우, 기존 세션 무시하고 새로 시작
    if (
      existingSession &&
      existingSession.isTemp &&
      existingSession.provider !== provider.name
    ) {
      console.log(
        `⚠️ Provider 변경 감지: ${existingSession.provider} → ${provider.name}, 기존 세션 무시하고 새로 시작`
      );
      // 기존 세션은 무시하고 아래 로직으로 새 provider로 진행
    }

    // Step 1: 액세스 토큰 획득
    const accessToken = await provider.getAccessToken(code, state || undefined);

    // Step 2: 사용자 정보 조회
    const userInfo = await provider.getUserInfo(accessToken);
    console.log(`${provider.name} 사용자 정보:`, {
      providerId: userInfo.providerId,
      email: userInfo.email,
      nickname: userInfo.nickname,
    });

    // Step 3: DB에서 사용자 조회
    let existingUser;
    try {
      existingUser = await provider.findUser(userInfo.providerId);
    } catch (dbError) {
      console.error('데이터베이스 조회 오류:', dbError);
      return createErrorResponse(request, mode, 'db_error');
    }

    // Step 4: 모드에 따라 처리
    let result;
    if (mode === 'signup') {
      result = await handleSignupFlow(userInfo, existingUser);
    } else {
      result = await handleLoginFlow(userInfo, existingUser);
    }

    // Step 5: 결과에 따라 리다이렉트
    return NextResponse.redirect(new URL(result.redirectUrl, request.url));
  } catch (err) {
    console.error(`${provider.name} 로그인 처리 중 오류:`, err);
    return NextResponse.redirect(
      new URL('/login?error=server_error', request.url)
    );
  }
}
