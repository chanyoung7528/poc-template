import { NextResponse } from "next/server";
import type { SessionUser } from "@/lib/types";
import { createSessionToken, setSessionCookie } from "@/lib/session";

/**
 * 일반 회원가입 (Wellness ID) 초기화 API
 *
 * 소셜 로그인이 아닌 일반 회원가입 플로우를 시작할 때 호출
 * 임시 세션을 생성하고 약관 동의 페이지로 이동
 *
 * POST /api/auth/wellness/init
 */
export async function POST() {
  try {
    console.log("🆕 일반 회원가입 (Wellness ID) 시작");

    // 일반 회원가입용 임시 세션 생성
    const tempUser: SessionUser = {
      id: `temp-wellness-${Date.now()}`,
      provider: "wellness" as "kakao" | "naver", // wellness를 임시로 추가
      isTemp: true,
      signupType: "wellness", // 일반 회원가입 구분자
    };

    // 임시 토큰 생성 및 쿠키 설정
    const tempToken = await createSessionToken(tempUser);
    await setSessionCookie(tempToken);

    console.log("✅ 일반 회원가입 임시 세션 생성 완료");

    return NextResponse.json({
      success: true,
      message: "일반 회원가입 모드로 시작되었습니다.",
      nextStep: "/terms-agreement",
    });
  } catch (error) {
    console.error("일반 회원가입 초기화 중 오류:", error);
    return NextResponse.json(
      { error: "server_error", message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
