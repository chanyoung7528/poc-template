import { NextRequest, NextResponse } from "next/server";
import { findUserByWellnessId } from "@/lib/database";

/**
 * Wellness ID 중복 확인 API
 * 
 * GET /api/auth/wellness/check-id?wellnessId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const wellnessId = searchParams.get("wellnessId");

    if (!wellnessId) {
      return NextResponse.json(
        { error: "missing_parameter", message: "wellnessId가 필요합니다." },
        { status: 400 }
      );
    }

    // 아이디 형식 검증 (영문 소문자, 숫자, 10-15자)
    const idRegex = /^[a-z0-9]{10,15}$/;
    if (!idRegex.test(wellnessId)) {
      return NextResponse.json(
        {
          error: "invalid_format",
          message: "아이디는 영문 소문자, 숫자 10-15자여야 합니다.",
        },
        { status: 400 }
      );
    }

    // DB에서 중복 확인
    const existingUser = await findUserByWellnessId(wellnessId);

    return NextResponse.json({
      isDuplicate: !!existingUser,
      message: existingUser
        ? "이미 사용중인 아이디입니다."
        : "사용 가능한 아이디입니다.",
    });
  } catch (error) {
    console.error("아이디 중복 확인 중 오류:", error);
    return NextResponse.json(
      { error: "server_error", message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
