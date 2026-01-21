import { NextRequest, NextResponse } from "next/server";
import { handleLoginFlow } from "@/lib/auth/login-handler";
import { handleSignupFlow } from "@/lib/auth/signup-handler";
import { findUserByKakaoId, findUserByEmail } from "@/lib/database";
import { createSessionToken, setSessionCookieOnResponse } from "@/lib/session";
import type { OAuthUserInfo } from "@/lib/auth/types";

/**
 * 네이티브 앱에서 받은 카카오 로그인 데이터 처리
 *
 * POST /api/auth/kakao/native
 * Body: {
 *   id: string;           // 카카오 사용자 ID
 *   nickname?: string;
 *   email?: string;
 *   profileImage?: string;
 *   cid?: string;         // 사용자 ID (id와 동일)
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, nickname, email, profileImage, cid } = body;

    console.log("📱 네이티브 카카오 로그인 API 호출 - body:", body);

    if (!id) {
      console.error("❌ 카카오 사용자 ID가 없음");
      return NextResponse.json(
        { error: "invalid_request", message: "카카오 사용자 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // OAuthUserInfo 형태로 변환
    const userInfo: OAuthUserInfo = {
      providerId: id,
      email: email || undefined,
      nickname: nickname || undefined,
      profileImage: profileImage || undefined,
      provider: "kakao",
    };

    console.log("📱 네이티브 카카오 로그인 요청:", {
      providerId: userInfo.providerId,
      email: userInfo.email,
      nickname: userInfo.nickname,
    });

    // DB에서 사용자 조회
    let existingUser;
    try {
      existingUser = await findUserByKakaoId(userInfo.providerId);
      console.log(
        "DB 조회 결과:",
        existingUser ? "기존 사용자" : "신규 사용자"
      );
    } catch (dbError) {
      console.error("❌ 데이터베이스 조회 오류:", dbError);
      return NextResponse.json(
        { error: "db_error", message: "사용자 조회 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    // 이메일로 다른 플랫폼 가입 확인 (신규 사용자인 경우)
    if (!existingUser && userInfo.email) {
      try {
        const emailUser = await findUserByEmail(userInfo.email);
        if (emailUser) {
          console.error(
            "❌ 이미 다른 플랫폼으로 가입된 이메일:",
            userInfo.email,
            emailUser.provider
          );
          return NextResponse.json(
            {
              error: "already_registered",
              message: "이미 다른 방법으로 가입된 이메일입니다.",
              provider: emailUser.provider,
            },
            { status: 400 }
          );
        }
      } catch (error) {
        console.error("이메일 조회 오류:", error);
      }
    }

    // 로그인 또는 회원가입 플로우 처리
    console.log(
      existingUser ? "🔄 로그인 플로우 실행" : "🆕 회원가입 플로우 실행"
    );
    const result = existingUser
      ? await handleLoginFlow(userInfo, existingUser)
      : await handleSignupFlow(userInfo, existingUser);

    console.log("플로우 처리 결과:", result);

    if (!result.success) {
      console.error("❌ 플로우 처리 실패:", result.error);
      return NextResponse.json(
        {
          error: result.error || "unknown_error",
          message: "로그인 처리 중 오류가 발생했습니다.",
          redirectUrl: result.redirectUrl,
        },
        { status: 400 }
      );
    }

    // sessionUser가 없으면 에러
    if (!result.sessionUser) {
      console.error("❌ 세션 사용자 정보가 없음:", result);
      return NextResponse.json(
        {
          error: "session_error",
          message: "세션 사용자 정보를 생성할 수 없습니다.",
        },
        { status: 500 }
      );
    }

    // 세션 토큰 생성 및 쿠키 설정
    try {
      console.log("🔐 세션 토큰 생성 시작:", {
        userId: result.sessionUser.id,
        provider: result.sessionUser.provider,
      });

      const sessionToken = await createSessionToken(result.sessionUser);

      console.log("✅ 세션 토큰 생성 완료");

      const response = NextResponse.json({
        success: true,
        redirectUrl: result.redirectUrl,
        isNewUser: !existingUser,
      });

      // 쿠키 설정
      setSessionCookieOnResponse(response, sessionToken);

      // 응답 헤더 확인
      console.log("📤 응답 헤더:", {
        setCookie: response.headers.get("set-cookie"),
        hasSetCookie: response.headers.has("set-cookie"),
      });

      console.log("✅ 카카오 네이티브 로그인 성공:", result.redirectUrl);
      return response;
    } catch (tokenError) {
      console.error("❌ 세션 토큰 생성 실패:", tokenError);
      console.error("에러 상세:", {
        message:
          tokenError instanceof Error ? tokenError.message : String(tokenError),
        stack: tokenError instanceof Error ? tokenError.stack : undefined,
        sessionUser: result.sessionUser,
      });
      return NextResponse.json(
        {
          error: "token_error",
          message: "세션 토큰 생성 중 오류가 발생했습니다.",
        },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("❌ 카카오 네이티브 로그인 처리 중 오류:", err);
    console.error("에러 상세 정보:", {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      name: err instanceof Error ? err.name : undefined,
    });
    return NextResponse.json(
      {
        error: "server_error",
        message:
          err instanceof Error
            ? `서버 오류: ${err.message}`
            : "서버 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}
