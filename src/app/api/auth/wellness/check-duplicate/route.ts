import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { findUserByPhone } from "@/lib/database";

/**
 * 본인인증 후 기존 회원 검증 API
 *
 * 일반 회원가입 시 본인인증 데이터로 기존 회원 여부 확인
 *
 * POST /api/auth/wellness/check-duplicate
 */
export async function POST(request: NextRequest) {
  try {
    // 세션에서 임시 사용자 정보 가져오기
    const sessionUser = await getSessionUser();

    console.log("🔍 일반 회원가입 중복 검증 - 세션 사용자:", {
      id: sessionUser?.id,
      signupType: sessionUser?.signupType,
      verified: sessionUser?.verified,
    });

    if (!sessionUser) {
      console.error("세션이 없습니다.");
      return NextResponse.json(
        { error: "unauthorized", message: "인증 정보가 없습니다." },
        { status: 401 }
      );
    }

    // 일반 회원가입인지 확인
    if (sessionUser.signupType !== "wellness") {
      console.error("일반 회원가입이 아닙니다:", sessionUser.signupType);
      return NextResponse.json(
        {
          error: "invalid_signup_type",
          message: "일반 회원가입 플로우가 아닙니다.",
        },
        { status: 400 }
      );
    }

    // 본인인증 완료 확인
    if (!sessionUser.verified || !sessionUser.verificationData) {
      console.error("본인인증이 완료되지 않았습니다.");
      return NextResponse.json(
        {
          error: "verification_required",
          message: "본인인증이 필요합니다.",
          redirectUrl: "/verify",
        },
        { status: 400 }
      );
    }

    const { phone } = sessionUser.verificationData;

    // 전화번호로 기존 회원 조회
    const existingUser = await findUserByPhone(phone);

    if (existingUser) {
      console.log("⚠️ 이미 가입된 전화번호:", phone);

      return NextResponse.json({
        isDuplicate: true,
        message: "이미 가입된 전화번호입니다.",
        provider: existingUser.provider,
        maskedId:
          existingUser.email?.[0] + "***@" + existingUser.email?.split("@")[1],
      });
    }

    console.log("✅ 신규 회원 확인 완료");

    return NextResponse.json({
      isDuplicate: false,
      message: "회원가입을 진행할 수 있습니다.",
    });
  } catch (error) {
    console.error("중복 검증 중 오류:", error);
    return NextResponse.json(
      { error: "server_error", message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
