import { NextRequest, NextResponse } from 'next/server';

/**
 * 회원가입 완료 리다이렉트 헬퍼 (DEPRECATED)
 *
 * 이 API는 더 이상 사용되지 않습니다.
 * OAuth 콜백에서 직접 회원가입 완료 처리를 수행합니다.
 *
 * 사용자가 직접 접근하는 것을 방지하기 위해 404 반환
 */
export async function GET(request: NextRequest) {
  console.warn(
    '⚠️ /api/auth/complete-signup-redirect에 직접 접근 시도됨. 이 API는 내부 처리용입니다.'
  );

  // 사용자가 직접 접근한 경우 회원가입 페이지로 리다이렉트
  return NextResponse.redirect(new URL('/signup', request.url));
}
