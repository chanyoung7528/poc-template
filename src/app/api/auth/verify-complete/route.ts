import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import type { SessionUser } from "@/lib/types";
import { createSessionToken, setSessionCookie } from "@/lib/session";

/**
 * 본인인증 완료 API
 *
 * 임시 세션 사용자의 본인인증 상태를 업데이트
 *
 * POST /api/auth/verify-complete
 * Body: {
 *   verificationData?: any // PASS 인증 결과 데이터
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 세션에서 임시 사용자 정보 가져오기
    const sessionUser = await getSessionUser();

    console.log("✅ 본인인증 완료 - 세션 사용자:", {
      id: sessionUser?.id,
      provider: sessionUser?.provider,
      isTemp: sessionUser?.isTemp,
      termsAgreed: sessionUser?.termsAgreed,
    });

    if (!sessionUser) {
      console.error("세션이 없습니다.");
      return NextResponse.json(
        { error: "unauthorized", message: "인증 정보가 없습니다." },
        { status: 401 }
      );
    }

    // 임시 사용자가 아니면 이미 가입된 사용자
    if (!sessionUser.isTemp) {
      console.error("이미 가입된 사용자입니다:", sessionUser.id);
      return NextResponse.json(
        { error: "already_registered", message: "이미 가입된 사용자입니다." },
        { status: 400 }
      );
    }

    // 약관 동의 확인
    if (!sessionUser.termsAgreed) {
      console.error("약관 동의가 필요합니다.");
      return NextResponse.json(
        {
          error: "terms_required",
          message: "약관 동의가 필요합니다.",
          redirectUrl: "/terms-agreement",
        },
        { status: 400 }
      );
    }

    // 요청 바디에서 본인인증 데이터 추출 (필요 시)
    const body = await request.json();
    const { verificationData } = body;

    console.log("✅ 본인인증 완료, 세션 업데이트");

    // 본인인증 완료 상태를 세션에 추가
    const updatedUser: SessionUser = {
      ...sessionUser,
      verified: true,
    };

    // 업데이트된 세션 토큰 생성
    const updatedToken = await createSessionToken(updatedUser);
    await setSessionCookie(updatedToken);

    console.log("✅ 본인인증 상태 세션에 저장 완료");

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: "본인인증이 완료되었습니다.",
      nextStep: "complete-signup", // DB 저장을 위한 최종 단계
    });
  } catch (error) {
    console.error("본인인증 업데이트 중 오류:", error);
    return NextResponse.json(
      { error: "server_error", message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
