import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { env } from "@/lib/config";
import type { SessionUser } from "./types";

const SESSION_COOKIE_NAME = "session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7일

/**
 * JWT 토큰 생성
 */
export async function createSessionToken(user: SessionUser): Promise<string> {
  const secret = new TextEncoder().encode(env.jwt.secret);

  console.log("🔐 세션 토큰 생성:", {
    id: user.id,
    provider: user.provider,
    isTemp: user.isTemp,
  });

  return await new SignJWT({
    user,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

/**
 * JWT 토큰 검증 및 디코드
 */
export async function verifySessionToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const secret = new TextEncoder().encode(env.jwt.secret);
    const { payload } = await jwtVerify(token, secret);

    const user = (payload.user as SessionUser) || null;

    if (user) {
      console.log("🔓 세션 토큰 검증 성공:", {
        id: user.id,
        provider: user.provider,
        isTemp: user.isTemp,
      });
    }

    return user;
  } catch (error) {
    console.error("토큰 검증 실패:", error);
    return null;
  }
}

/**
 * 세션 쿠키 설정 (Route Handler용)
 * NextResponse에 쿠키를 설정합니다
 */
export function setSessionCookieOnResponse(
  response: NextResponse,
  token: string
): NextResponse {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: SESSION_MAX_AGE,
    path: "/",
  };

  console.log("🍪 세션 쿠키 설정:", {
    name: SESSION_COOKIE_NAME,
    options: cookieOptions,
    tokenLength: token.length,
  });

  response.cookies.set(SESSION_COOKIE_NAME, token, cookieOptions);

  // 쿠키가 제대로 설정되었는지 확인
  const setCookie = response.cookies.get(SESSION_COOKIE_NAME);
  console.log("✅ 쿠키 설정 확인:", {
    exists: !!setCookie,
    value: setCookie?.value?.substring(0, 20) + "...",
  });

  return response;
}

/**
 * 세션 쿠키 설정 (레거시 호환용 - Server Component에서 사용)
 * @deprecated Route Handler에서는 setSessionCookieOnResponse를 사용하세요
 */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
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

/**
 * 세션 사용자 정보 가져오기 (별칭)
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  return await getCurrentUser();
}
