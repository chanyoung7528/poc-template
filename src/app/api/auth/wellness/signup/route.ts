import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { createWellnessUser, findUserByWellnessId } from "@/lib/database";
import { createSessionToken, setSessionCookie } from "@/lib/session";
import type { SessionUser } from "@/lib/types";
import * as bcrypt from "bcryptjs";

/**
 * 일반 회원가입 (Wellness ID) 완료 API
 *
 * ID/Password 입력 후 최종 회원가입 처리
 *
 * POST /api/auth/wellness/signup
 * Body: {
 *   wellnessId: string,
 *   password: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // 세션에서 임시 사용자 정보 가져오기
    const sessionUser = await getSessionUser();

    console.log("📋 일반 회원가입 완료 - 세션 사용자:", {
      id: sessionUser?.id,
      signupType: sessionUser?.signupType,
      termsAgreed: sessionUser?.termsAgreed,
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

    // 본인인증 확인
    if (!sessionUser.verified || !sessionUser.verificationData) {
      console.error("본인인증이 필요합니다.");
      return NextResponse.json(
        {
          error: "verification_required",
          message: "본인인증이 필요합니다.",
          redirectUrl: "/verify",
        },
        { status: 400 }
      );
    }

    // 요청 바디에서 ID/Password 추출
    const body = await request.json();
    const { wellnessId, password } = body;

    if (!wellnessId || !password) {
      console.error("필수 정보 누락:", { wellnessId, password: !!password });
      return NextResponse.json(
        { error: "missing_fields", message: "필수 정보를 입력해주세요." },
        { status: 400 }
      );
    }

    // ID 중복 확인
    const existingUser = await findUserByWellnessId(wellnessId);
    if (existingUser) {
      console.error("이미 사용 중인 아이디:", wellnessId);
      return NextResponse.json(
        { error: "duplicate_id", message: "이미 사용 중인 아이디입니다." },
        { status: 409 }
      );
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("✅ DB에 사용자 저장 시작");

    // DB에 사용자 생성
    const { name, phone, birth, gender } = sessionUser.verificationData;

    const newUser = await createWellnessUser({
      wellnessId,
      passwordHash: hashedPassword,
      email: null, // 일반 회원가입은 이메일 없음 (필요시 추가 수집)
      nickname: name,
      name,
      phone,
      birth,
      gender,
    });

    console.log("✅ DB에 사용자 생성 완료:", newUser.id);

    // 정식 세션 토큰 생성 (isTemp 제거)
    // Prisma Client 타입이 업데이트되었지만 TypeScript 캐시 문제로 타입 단언 사용
    const userWithWellnessId = newUser as typeof newUser & {
      wellnessId: string | null;
    };
    const finalSessionUser: SessionUser = {
      id: userWithWellnessId.id,
      wellnessId: userWithWellnessId.wellnessId || undefined,
      email: userWithWellnessId.email || undefined,
      nickname: userWithWellnessId.nickname || undefined,
      profileImage: userWithWellnessId.profileImage || undefined,
      provider: "wellness",
    };

    console.log("🔄 정식 세션 생성:", {
      id: finalSessionUser.id,
      provider: finalSessionUser.provider,
      isTemp: finalSessionUser.isTemp,
    });

    const finalSessionToken = await createSessionToken(finalSessionUser);
    await setSessionCookie(finalSessionToken);

    console.log("✅ 일반 회원가입 완료 및 로그인:", newUser.id);

    // 성공 응답
    return NextResponse.json({
      success: true,
      userId: newUser.id,
      message: "회원가입이 완료되었습니다.",
      redirectUrl: "/main",
    });
  } catch (error) {
    console.error("일반 회원가입 완료 처리 중 오류:", error);
    return NextResponse.json(
      { error: "server_error", message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
