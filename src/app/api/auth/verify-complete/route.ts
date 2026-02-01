import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import type { SessionUser } from "@/lib/types";
import { createSessionToken, setSessionCookieOnResponse } from "@/lib/session";
import {
  findUserByPhone,
  createKakaoUser,
  createNaverUser,
} from "@/lib/database";

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
      signupType: sessionUser?.signupType,
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

    // 요청 바디에서 본인인증 데이터 추출
    const body = await request.json();
    const { verificationData } = body;

    console.log("✅ 본인인증 완료, 세션 업데이트");

    // 본인인증 완료 상태를 세션에 추가 (✅ 토큰 정보 유지)
    const updatedUser: SessionUser = {
      ...sessionUser,
      verified: true,
      verificationData: verificationData || sessionUser.verificationData,
      // ✅ 토큰 정보 명시적으로 유지
      accessToken: sessionUser.accessToken,
      refreshToken: sessionUser.refreshToken,
      tokenType: sessionUser.tokenType,
      expiresAt: sessionUser.expiresAt,
    };

    // 업데이트된 세션 토큰 생성
    const updatedToken = await createSessionToken(updatedUser);

    console.log("✅ 본인인증 상태 세션에 저장 완료");

    // 일반 회원가입(wellness)인 경우 중복 확인 후 JSON 응답
    if (sessionUser.signupType === "wellness") {
      const { phone } = updatedUser.verificationData || {};

      if (phone) {
        // 전화번호로 기존 회원 조회
        const existingUser = await findUserByPhone(phone);

        if (existingUser) {
          console.log("⚠️ 이미 가입된 전화번호:", phone);

          // 중복 계정 페이지로 이동 (JSON 응답)
          const response = NextResponse.json({
            success: false,
            error: "duplicate_phone",
            redirectUrl: `/duplicate-account?provider=${existingUser.provider}&phone=${phone}`,
            signupType: "wellness",
          });

          setSessionCookieOnResponse(response, updatedToken);

          console.log("🍪 중복 확인 완료 - JSON 응답에 쿠키 설정");
          return response;
        }
      }

      // 중복이 아니면 ID/PW 입력 페이지로 이동 (JSON 응답)
      console.log("✅ 신규 웰니스 회원 확인 완료, ID/PW 입력 페이지로 이동");

      const response = NextResponse.json({
        success: true,
        redirectUrl: "/signup/credentials",
        signupType: "wellness",
      });

      setSessionCookieOnResponse(response, updatedToken);

      console.log("🍪 웰니스 본인인증 완료 - JSON 응답에 쿠키 설정");
      return response;
    }

    // 소셜 회원가입 (signupType === 'social' 또는 provider가 kakao/naver)
    const isSocialSignup =
      sessionUser.signupType === "social" ||
      sessionUser.provider === "kakao" ||
      sessionUser.provider === "naver";

    if (isSocialSignup) {
      console.log("📱 소셜 로그인 - DB 저장 및 회원가입 완료");

      // DB에 사용자 저장
      let newUser;
      if (sessionUser.provider === "kakao" && sessionUser.kakaoId) {
        newUser = await createKakaoUser({
          kakaoId: sessionUser.kakaoId,
          email: sessionUser.email || null,
          nickname: sessionUser.nickname || null,
          profileImage: sessionUser.profileImage || null,
          marketingAgreed: false,
          // ✅ 토큰 정보 전달
          accessToken: sessionUser.accessToken,
          refreshToken: sessionUser.refreshToken,
          tokenType: sessionUser.tokenType,
          expiresAt: sessionUser.expiresAt,
        });
      } else if (sessionUser.provider === "naver" && sessionUser.naverId) {
        newUser = await createNaverUser({
          naverId: sessionUser.naverId,
          email: sessionUser.email || null,
          nickname: sessionUser.nickname || null,
          profileImage: sessionUser.profileImage || null,
          marketingAgreed: false,
          // ✅ 토큰 정보 전달
          accessToken: sessionUser.accessToken,
          refreshToken: sessionUser.refreshToken,
          tokenType: sessionUser.tokenType,
          expiresAt: sessionUser.expiresAt,
        });
      } else {
        console.error("유효하지 않은 Provider:", sessionUser.provider);
        return NextResponse.json(
          {
            error: "invalid_provider",
            message: "유효하지 않은 소셜 로그인입니다.",
          },
          { status: 400 }
        );
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
        isTemp: undefined, // 명시적으로 제거
      };

      const finalSessionToken = await createSessionToken(finalSessionUser);

      console.log("✅ 소셜 회원가입 완료:", newUser.id);

      // 회원가입 완료 페이지로 이동 (JSON 응답으로 클라이언트에서 처리)
      const displayName = newUser.nickname || newUser.email || "회원";
      const redirectUrl = `/signup/complete?wellnessId=${encodeURIComponent(displayName)}`;

      // JSON 응답으로 반환 (클라이언트에서 router.push() 사용)
      const response = NextResponse.json({
        success: true,
        redirectUrl,
        signupType: "social",
        userId: newUser.id,
      });

      setSessionCookieOnResponse(response, finalSessionToken);

      console.log("🍪 소셜 회원가입 완료 - JSON 응답에 쿠키 설정");
      return response;
    }

    // 예상치 못한 상태
    console.error("⚠️ 알 수 없는 회원가입 유형:", {
      signupType: sessionUser.signupType,
      provider: sessionUser.provider,
    });
    return NextResponse.json(
      {
        error: "unknown_signup_type",
        message: "알 수 없는 회원가입 유형입니다.",
      },
      { status: 400 }
    );
  } catch (error) {
    console.error("본인인증 업데이트 중 오류:", error);
    return NextResponse.json(
      { error: "server_error", message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
