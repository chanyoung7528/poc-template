import type { SessionUser } from "@/lib/types";
import { createSessionToken, setSessionCookie } from "@/lib/session";
import { findUserByEmail } from "@/lib/database";
import type { OAuthUserInfo } from "./types";
import type { User } from "@prisma/client";

/**
 * 회원가입 처리 결과
 */
export interface SignupResult {
  success: boolean;
  redirectUrl: string;
  error?: string;
}

/**
 * 회원가입 플로우 처리
 * 1. 이미 가입된 사용자인지 확인
 * 2. 이메일로 다른 플랫폼 가입 확인
 * 3. 임시 토큰 생성 후 약관 동의 페이지로 리다이렉트
 */
export async function handleSignupFlow(
  userInfo: OAuthUserInfo,
  existingUser: User | null
): Promise<SignupResult> {
  // 이미 가입된 사용자
  if (existingUser) {
    console.log(`⚠️ 이미 가입된 ${userInfo.provider} 계정:`, userInfo.providerId);
    return {
      success: false,
      redirectUrl: "/signup?error=already_registered",
      error: "already_registered",
    };
  }

  // 이메일로 다른 플랫폼 가입 확인
  if (userInfo.email) {
    try {
      const emailUser = await findUserByEmail(userInfo.email);
      if (emailUser) {
        console.error(
          "❌ 이미 다른 플랫폼으로 가입된 이메일:",
          userInfo.email,
          emailUser.provider
        );
        return {
          success: false,
          redirectUrl: `/signup?error=already_registered&provider=${emailUser.provider}`,
          error: "already_registered",
        };
      }
    } catch (error) {
      console.error("이메일 조회 오류:", error);
      return {
        success: false,
        redirectUrl: "/signup?error=db_error",
        error: "db_error",
      };
    }
  }

  // 임시 세션 사용자 생성
  const tempUser: SessionUser = {
    id: `temp-${userInfo.provider}-${userInfo.providerId}`,
    [userInfo.provider === "kakao" ? "kakaoId" : "naverId"]: userInfo.providerId,
    email: userInfo.email,
    nickname: userInfo.nickname,
    profileImage: userInfo.profileImage,
    provider: userInfo.provider,
    isTemp: true,
  };

  console.log("🆕 신규 회원 - 약관 동의 페이지로 이동:", userInfo.providerId);

  // 임시 토큰 생성 및 쿠키 설정
  try {
    const tempToken = await createSessionToken(tempUser);
    await setSessionCookie(tempToken);

    return {
      success: true,
      redirectUrl: "/terms-agreement",
    };
  } catch (error) {
    console.error("세션 토큰 생성 오류:", error);
    return {
      success: false,
      redirectUrl: "/signup?error=session_error",
      error: "session_error",
    };
  }
}
