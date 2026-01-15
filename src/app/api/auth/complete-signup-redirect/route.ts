import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { createKakaoUser, createNaverUser } from "@/lib/database";
import type { SessionUser } from "@/lib/types";
import { createSessionToken, setSessionCookie } from "@/lib/session";

/**
 * 회원가입 완료 리다이렉트 헬퍼
 * 
 * OAuth 콜백에서 이미 본인인증까지 완료된 사용자를 
 * 회원가입 완료 처리 후 메인으로 리다이렉트
 */
export async function GET() {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser || !sessionUser.isTemp) {
      return NextResponse.redirect(new URL("/signup", process.env.NEXT_PUBLIC_BASE_URL || ""));
    }

    if (!sessionUser.termsAgreed || !sessionUser.verified) {
      return NextResponse.redirect(new URL("/terms-agreement", process.env.NEXT_PUBLIC_BASE_URL || ""));
    }

    // DB에 사용자 저장
    let newUser;
    if (sessionUser.provider === "kakao" && sessionUser.kakaoId) {
      newUser = await createKakaoUser({
        kakaoId: sessionUser.kakaoId,
        email: sessionUser.email || null,
        nickname: sessionUser.nickname || null,
        profileImage: sessionUser.profileImage || null,
        marketingAgreed: false,
      });
    } else if (sessionUser.provider === "naver" && sessionUser.naverId) {
      newUser = await createNaverUser({
        naverId: sessionUser.naverId,
        email: sessionUser.email || null,
        nickname: sessionUser.nickname || null,
        profileImage: sessionUser.profileImage || null,
        marketingAgreed: false,
      });
    } else {
      return NextResponse.redirect(new URL("/signup?error=invalid_provider", process.env.NEXT_PUBLIC_BASE_URL || ""));
    }

    // 정식 세션 생성
    const finalSessionUser: SessionUser = {
      id: newUser.id,
      kakaoId: newUser.kakaoId || undefined,
      naverId: newUser.naverId || undefined,
      email: newUser.email || undefined,
      nickname: newUser.nickname || undefined,
      profileImage: newUser.profileImage || undefined,
      provider: sessionUser.provider,
    };

    const finalSessionToken = await createSessionToken(finalSessionUser);
    await setSessionCookie(finalSessionToken);

    console.log("✅ 회원가입 완료:", newUser.id);

    return NextResponse.redirect(new URL("/main", process.env.NEXT_PUBLIC_BASE_URL || ""));
  } catch (error) {
    console.error("회원가입 완료 리다이렉트 오류:", error);
    return NextResponse.redirect(new URL("/signup?error=server_error", process.env.NEXT_PUBLIC_BASE_URL || ""));
  }
}
