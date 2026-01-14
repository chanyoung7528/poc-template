import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { env } from '@/lib/config';
import type { SessionUser } from './types';

const SESSION_COOKIE_NAME = 'session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7일

/**
 * JWT 토큰 생성
 */
export async function createSessionToken(user: SessionUser): Promise<string> {
  const secret = new TextEncoder().encode(env.jwt.secret);

  return await new SignJWT({
    user,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);
}

/**
 * JWT 토큰 검증 및 디코드
 */
export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const secret = new TextEncoder().encode(env.jwt.secret);
    const { payload } = await jwtVerify(token, secret);

    return (payload.user as SessionUser) || null;
  } catch (error) {
    console.error('토큰 검증 실패:', error);
    return null;
  }
}

/**
 * 세션 쿠키 설정
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  });
}

/**
 * 세션 쿠키 가져오기
 */
export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

/**
 * 세션 쿠키 삭제
 */
export async function deleteSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * 현재 로그인한 사용자 정보 가져오기
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = await getSessionCookie();

  if (!token) {
    return null;
  }

  return await verifySessionToken(token);
}
