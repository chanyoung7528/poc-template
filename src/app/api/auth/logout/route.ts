import { NextResponse } from 'next/server';
import { deleteSessionCookie } from '@/lib/session';

export async function POST() {
  try {
    // 세션 쿠키 삭제
    await deleteSessionCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('로그아웃 처리 중 오류:', error);
    return NextResponse.json(
      { error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
