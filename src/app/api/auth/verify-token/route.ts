import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import { findUserById } from "@/lib/database";

interface TokenVerificationResult {
  success: boolean;
  provider?: string;
  verification?: any;
  storedToken?: {
    accessToken?: string;
    refreshToken?: string | null;
    tokenType?: string | null;
    expiresAt?: Date | null;
  };
  user?: {
    id: string;
    email?: string | null;
    nickname?: string | null;
    provider: string;
    createdAt: Date;
  };
  error?: string;
  message?: string;
  errorData?: any;
}

/**
 * 카카오/네이버 AccessToken 검증 API
 *
 * GET /api/auth/verify-token
 * 검증 후 /token-verify 페이지로 리다이렉트
 */
export async function GET(request: NextRequest) {
  try {
    // 현재 로그인한 사용자 정보 가져오기
    const sessionUser = await getCurrentUser();

    if (!sessionUser) {
      const url = new URL("/token-verify", request.url);
      url.searchParams.set("error", "unauthorized");
      url.searchParams.set("message", "로그인이 필요합니다.");
      return NextResponse.redirect(url);
    }

    // DB에서 사용자 정보 조회 (accessToken 포함)
    const user = await findUserById(sessionUser.id);

    if (!user) {
      const url = new URL("/token-verify", request.url);
      url.searchParams.set("error", "user_not_found");
      url.searchParams.set("message", "사용자를 찾을 수 없습니다.");
      return NextResponse.redirect(url);
    }

    if (!user.accessToken) {
      const url = new URL("/token-verify", request.url);
      url.searchParams.set("error", "no_token");
      url.searchParams.set("message", "AccessToken이 없습니다.");
      url.searchParams.set("provider", user.provider);
      return NextResponse.redirect(url);
    }

    let result: TokenVerificationResult;

    // Provider별 토큰 검증
    if (user.provider === "kakao") {
      // 카카오 토큰 검증
      const response = await fetch(
        "https://kapi.kakao.com/v1/user/access_token_info",
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        result = {
          success: false,
          provider: "kakao",
          error: "토큰 검증 실패",
          errorData,
          storedToken: {
            accessToken: user.accessToken?.substring(0, 20) + "...",
            refreshToken: user.refreshToken
              ? user.refreshToken.substring(0, 20) + "..."
              : null,
            tokenType: user.tokenType,
            expiresAt: user.expiresAt,
          },
        };
      } else {
        const verificationResult = await response.json();
        result = {
          success: true,
          provider: "kakao",
          verification: verificationResult,
          storedToken: {
            accessToken: user.accessToken?.substring(0, 20) + "...",
            refreshToken: user.refreshToken
              ? user.refreshToken.substring(0, 20) + "..."
              : null,
            tokenType: user.tokenType,
            expiresAt: user.expiresAt,
          },
          user: {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
            provider: user.provider,
            createdAt: user.createdAt,
          },
        };
      }
    } else if (user.provider === "naver") {
      // 네이버 토큰 검증
      const response = await fetch("https://openapi.naver.com/v1/nid/me", {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        result = {
          success: false,
          provider: "naver",
          error: "토큰 검증 실패",
          errorData,
          storedToken: {
            accessToken: user.accessToken?.substring(0, 20) + "...",
            refreshToken: user.refreshToken
              ? user.refreshToken.substring(0, 20) + "..."
              : null,
            tokenType: user.tokenType,
            expiresAt: user.expiresAt,
          },
        };
      } else {
        const verificationResult = await response.json();
        result = {
          success: true,
          provider: "naver",
          verification: verificationResult,
          storedToken: {
            accessToken: user.accessToken?.substring(0, 20) + "...",
            refreshToken: user.refreshToken
              ? user.refreshToken.substring(0, 20) + "..."
              : null,
            tokenType: user.tokenType,
            expiresAt: user.expiresAt,
          },
          user: {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
            provider: user.provider,
            createdAt: user.createdAt,
          },
        };
      }
    } else {
      result = {
        success: false,
        error: "unsupported_provider",
        message: `${user.provider} provider는 지원하지 않습니다.`,
      };
    }

    // 결과를 쿼리 파라미터로 인코딩하여 리다이렉트
    const url = new URL("/token-verify", request.url);
    url.searchParams.set("data", encodeURIComponent(JSON.stringify(result)));

    return NextResponse.redirect(url);
  } catch (error) {
    console.error("토큰 검증 중 오류:", error);
    const url = new URL("/token-verify", request.url);
    url.searchParams.set("error", "server_error");
    url.searchParams.set(
      "message",
      error instanceof Error ? error.message : "서버 오류가 발생했습니다."
    );
    return NextResponse.redirect(url);
  }
}
