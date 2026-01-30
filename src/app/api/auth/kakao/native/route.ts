import { NextRequest, NextResponse } from "next/server";
import { handleLoginFlow } from "@/lib/auth/login-handler";
import { handleSignupFlow } from "@/lib/auth/signup-handler";
import { findUserByKakaoId, findUserByEmail } from "@/lib/database";
import { createSessionToken, setSessionCookieOnResponse } from "@/lib/session";
import { prisma } from "@/lib/prisma";
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
    const { 
      id, 
      nickname, 
      email, 
      profileImage, 
      cid, 
      mode = "login",
      accessToken,
      refreshToken,
      tokenType,
      expiresIn
    } = body; // ✅ token 파라미터 추가

    console.log("📱 네이티브 카카오 로그인 API 호출 - body:", body);
    console.log("🔐 모드:", mode);

    if (!id) {
      console.error("❌ 카카오 사용자 ID가 없음");
      const url = new URL("/token-verify", request.url);
      url.searchParams.set("error", "invalid_request");
      url.searchParams.set("message", "카카오 사용자 ID가 필요합니다.");
      return NextResponse.redirect(url);
    }

    // expiresAt 계산 (expiresIn이 있는 경우)
    const expiresAt = expiresIn 
      ? new Date(Date.now() + expiresIn * 1000) 
      : undefined;

    // ✅ accessToken이 있으면 먼저 카카오 API로 검증
    let tokenVerificationResult: any = null;
    if (accessToken) {
      try {
        console.log("🔐 카카오 토큰 검증 시작");
        const verificationResponse = await fetch(
          "https://kapi.kakao.com/v1/user/access_token_info",
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!verificationResponse.ok) {
          const errorData = await verificationResponse.json();
          console.error("❌ 카카오 토큰 검증 실패:", errorData);
          
          // 검증 실패 시 에러 페이지로 리다이렉트
          const url = new URL("/token-verify", request.url);
          url.searchParams.set(
            "data",
            encodeURIComponent(
              JSON.stringify({
                success: false,
                provider: "kakao",
                error: "토큰 검증 실패",
                errorData,
                storedToken: {
                  accessToken: accessToken.substring(0, 20) + "...",
                  refreshToken: refreshToken ? refreshToken.substring(0, 20) + "..." : null,
                  tokenType: tokenType,
                  expiresAt: expiresAt,
                },
              })
            )
          );
          return NextResponse.redirect(url);
        }

        tokenVerificationResult = await verificationResponse.json();
        console.log("✅ 카카오 토큰 검증 성공:", tokenVerificationResult);
      } catch (verificationError) {
        console.error("❌ 카카오 토큰 검증 중 오류:", verificationError);
        const url = new URL("/token-verify", request.url);
        url.searchParams.set(
          "data",
          encodeURIComponent(
            JSON.stringify({
              success: false,
              provider: "kakao",
              error: "토큰 검증 중 오류 발생",
              message:
                verificationError instanceof Error
                  ? verificationError.message
                  : "알 수 없는 오류",
            })
          )
        );
        return NextResponse.redirect(url);
      }
    }

    // OAuthUserInfo 형태로 변환
    const userInfo: OAuthUserInfo = {
      providerId: id,
      email: email || undefined,
      nickname: nickname || undefined,
      profileImage: profileImage || undefined,
      provider: "kakao",
      accessToken: accessToken || undefined,
      refreshToken: refreshToken || undefined,
      tokenType: tokenType || undefined,
      expiresAt: expiresAt,
    };

    console.log("📱 네이티브 카카오 로그인 요청:", {
      providerId: userInfo.providerId,
      email: userInfo.email,
      nickname: userInfo.nickname,
      tokenVerified: !!tokenVerificationResult,
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
      const url = new URL("/token-verify", request.url);
      url.searchParams.set("error", "db_error");
      url.searchParams.set("message", "사용자 조회 중 오류가 발생했습니다.");
      return NextResponse.redirect(url);
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
          const url = new URL("/token-verify", request.url);
          url.searchParams.set("error", "already_registered");
          url.searchParams.set("message", "이미 다른 방법으로 가입된 이메일입니다.");
          url.searchParams.set("provider", emailUser.provider);
          return NextResponse.redirect(url);
        }
      } catch (error) {
        console.error("이메일 조회 오류:", error);
      }
    }

    // 로그인 또는 회원가입 플로우 처리
    // mode가 'signup'이면 무조건 회원가입 플로우, 'login'이면 기존 로직 유지
    let result;
    if (mode === "signup") {
      console.log("🆕 회원가입 모드 - 회원가입 플로우 실행");
      result = await handleSignupFlow(userInfo, existingUser);
    } else {
      console.log(
        existingUser ? "🔄 로그인 플로우 실행" : "🆕 회원가입 플로우 실행"
      );
      result = existingUser
        ? await handleLoginFlow(userInfo, existingUser)
        : await handleSignupFlow(userInfo, existingUser);
    }

    console.log("플로우 처리 결과:", result);

    if (!result.success) {
      console.error("❌ 플로우 처리 실패:", result.error);
      const url = new URL("/token-verify", request.url);
      url.searchParams.set("error", result.error || "unknown_error");
      url.searchParams.set("message", "로그인 처리 중 오류가 발생했습니다.");
      return NextResponse.redirect(url);
    }

    // sessionUser가 없으면 에러
    if (!result.sessionUser) {
      console.error("❌ 세션 사용자 정보가 없음:", result);
      const url = new URL("/token-verify", request.url);
      url.searchParams.set("error", "session_error");
      url.searchParams.set("message", "세션 사용자 정보를 생성할 수 없습니다.");
      return NextResponse.redirect(url);
    }

    // 세션 토큰 생성 및 쿠키 설정
    try {
      console.log("🔐 세션 토큰 생성 시작:", {
        userId: result.sessionUser.id,
        provider: result.sessionUser.provider,
      });

      const sessionToken = await createSessionToken(result.sessionUser);

      console.log("✅ 세션 토큰 생성 완료");

      // ✅ DB에서 최종 사용자 정보 조회 (createdAt 포함)
      const finalUser = await prisma.user.findUnique({
        where: { id: result.sessionUser.id },
        select: {
          id: true,
          email: true,
          nickname: true,
          provider: true,
          createdAt: true,
        },
      });

      // ✅ DB 저장 후 검증 결과와 함께 /token-verify 페이지로 리다이렉트
      const url = new URL("/token-verify", request.url);
      
      // 검증 결과 데이터 구성
      const verificationData = {
        success: true,
        provider: "kakao",
        verification: tokenVerificationResult,
        storedToken: {
          accessToken: accessToken ? accessToken.substring(0, 20) + "..." : undefined,
          refreshToken: refreshToken ? refreshToken.substring(0, 20) + "..." : null,
          tokenType: tokenType,
          expiresAt: expiresAt,
        },
        user: finalUser
          ? {
              id: finalUser.id,
              email: finalUser.email,
              nickname: finalUser.nickname,
              provider: finalUser.provider,
              createdAt: finalUser.createdAt.toISOString(),
            }
          : {
              id: result.sessionUser.id,
              email: result.sessionUser.email,
              nickname: result.sessionUser.nickname,
              provider: result.sessionUser.provider,
              createdAt: new Date().toISOString(),
            },
        isNewUser: !existingUser,
      };

      url.searchParams.set("data", encodeURIComponent(JSON.stringify(verificationData)));

      const response = NextResponse.redirect(url);
      
      // 쿠키 설정
      setSessionCookieOnResponse(response, sessionToken);

      console.log("✅ 카카오 네이티브 로그인 성공, 토큰 검증 페이지로 리다이렉트");
      return response;
    } catch (tokenError) {
      console.error("❌ 세션 토큰 생성 실패:", tokenError);
      console.error("에러 상세:", {
        message:
          tokenError instanceof Error ? tokenError.message : String(tokenError),
        stack: tokenError instanceof Error ? tokenError.stack : undefined,
        sessionUser: result.sessionUser,
      });
      
      const url = new URL("/token-verify", request.url);
      url.searchParams.set(
        "data",
        encodeURIComponent(
          JSON.stringify({
            success: false,
            provider: "kakao",
            error: "token_error",
            message: "세션 토큰 생성 중 오류가 발생했습니다.",
          })
        )
      );
      return NextResponse.redirect(url);
    }
  } catch (err) {
    console.error("❌ 카카오 네이티브 로그인 처리 중 오류:", err);
    console.error("에러 상세 정보:", {
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      name: err instanceof Error ? err.name : undefined,
    });
    const url = new URL("/token-verify", request.url);
    url.searchParams.set("error", "server_error");
    url.searchParams.set(
      "message",
      err instanceof Error
        ? `서버 오류: ${err.message}`
        : "서버 오류가 발생했습니다."
    );
    return NextResponse.redirect(url);
  }
}
