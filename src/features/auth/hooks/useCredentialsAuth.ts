import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { useVerifyCertification } from "@/domains/auth/model/auth.queries";

interface SessionData {
  user: {
    provider: string;
    signupType?: string;
    verified?: boolean;
  } | null;
}

interface UseCredentialsAuthReturn {
  isVerifying: boolean;
  hasProcessed: boolean;
}

// 소셜 로그인 여부 확인
function isSocialSignup(sessionData: SessionData): boolean {
  if (!sessionData.user) return false;

  return (
    sessionData.user.signupType === "social" ||
    (sessionData.user.provider !== "wellness" && !sessionData.user.signupType)
  );
}

// 웰니스 회원가입 확인
function isWellnessSignup(sessionData: SessionData): boolean {
  if (!sessionData.user) return false;

  return (
    sessionData.user.signupType === "wellness" &&
    sessionData.user.verified === true
  );
}

export function useCredentialsAuth(): UseCredentialsAuthReturn {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [hasProcessed, setHasProcessed] = useState(false);
  const verifyCertificationMutation = useVerifyCertification();

  useEffect(() => {
    // verified=true 파라미터가 있으면 본인인증 완료 상태 - 바로 폼 표시
    const verifiedParam = searchParams.get("verified");
    if (verifiedParam === "true") {
      console.log("✅ verified=true 파라미터 감지 - 바로 폼 표시");
      setHasProcessed(true);
      // URL 정리
      window.history.replaceState({}, "", "/signup/credentials");
      setIsVerifying(false);
      return;
    }

    if (hasProcessed) {
      console.log("ℹ️ 이미 처리 완료됨, 스킵");
      return;
    }

    processAuthentication();
  }, [hasProcessed, searchParams]); // ✅ searchParams 의존성 추가

  const processAuthentication = async () => {
    try {
      // 1. URL 파라미터 확인
      const impUid = searchParams.get("imp_uid");
      const impSuccess =
        searchParams.get("imp_success") || searchParams.get("success");

      console.log("📱 URL 파라미터 확인:", {
        imp_uid: impUid,
        imp_success: impSuccess,
      });

      // 2. 본인인증 리다이렉트 결과 처리
      if (impUid && impSuccess === "true") {
        await handleCertificationRedirect(impUid);
        return;
      }

      // 3. 직접 접근 시 세션 확인
      await handleDirectAccess();
    } catch (error) {
      console.error("인증 처리 중 오류:", error);
      alert("인증 처리 중 오류가 발생했습니다.");
      router.push("/verify");
    }
  };

  const handleCertificationRedirect = async (impUid: string) => {
    console.log("✅ 본인인증 성공, 서버 검증 시작...");
    setHasProcessed(true);

    verifyCertificationMutation.mutate(impUid, {
      onSuccess: async (certResult) => {
        console.log("✅ 서버 검증 완료:", certResult);

        // 이미 가입된 사용자
        if (certResult.status === "EXISTING") {
          const resultPath =
            `/auth/result?maskedId=${certResult.user?.maskedId}&provider=${certResult.user?.provider}` as Route;
          router.push(resultPath);
          return;
        }

        // 14세 미만
        if (certResult.status === "UNDER_14") {
          router.push("/auth/guide/minor" as Route);
          return;
        }

        // 본인인증 완료 처리
        await completeCertification(certResult.certificationData);
      },
      onError: (error) => {
        console.error("본인인증 검증 실패:", error);
        alert("본인인증 검증에 실패했습니다. 다시 시도해주세요.");
        router.push("/verify");
      },
    });
  };

  const completeCertification = async (certificationData: any) => {
    try {
      const response = await fetch("/api/auth/verify-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verificationData: certificationData }),
      });

      if (!response.ok) {
        const data = await response.json();
        handleVerifyCompleteError(data.error);
        return;
      }

      const data = await response.json();
      console.log("✅ 본인인증 완료 응답:", data);

      // 중복 전화번호 등의 에러 처리
      if (
        !data.success &&
        data.error === "duplicate_phone" &&
        data.redirectUrl
      ) {
        console.log("⚠️ 중복 전화번호 - 중복 계정 페이지로 이동");
        router.push(data.redirectUrl);
        return;
      }

      // 소셜 로그인인 경우 서버에서 반환한 redirectUrl로 이동
      if (data.signupType === "social" && data.redirectUrl) {
        console.log("📱 소셜 로그인 완료 - 회원가입 완료 페이지로 이동");
        router.push(data.redirectUrl);
        return;
      }

      // 웰니스 회원가입인 경우
      if (data.signupType === "wellness" && data.redirectUrl) {
        console.log("✅ 웰니스 회원가입 - 아이디/비밀번호 입력 페이지로 이동");
        // verified=true 플래그를 URL에 추가하여 직접 폼 표시
        const credentialsPath = `${data.redirectUrl}?verified=true` as Route;
        router.push(credentialsPath);
        return;
      }

      // 기본 폴백: 현재 페이지에서 폼 표시
      console.log("✅ 본인인증 완료 - 폼 표시");
      window.history.replaceState({}, "", "/signup/credentials");
      setIsVerifying(false);
    } catch (error) {
      console.error("본인인증 완료 처리 중 오류:", error);
      alert("본인인증 처리 중 오류가 발생했습니다.");
      router.push("/verify");
    }
  };

  const handleVerifyCompleteError = (error: string) => {
    if (error === "terms_required") {
      alert("약관 동의가 필요합니다.");
      router.push("/terms-agreement");
    } else {
      alert("본인인증 처리 중 오류가 발생했습니다.");
      router.push("/verify");
    }
  };

  const handleDirectAccess = async () => {
    console.log("ℹ️ 직접 접근 - 세션 확인");

    const response = await fetch("/api/auth/session");
    const sessionData: SessionData = await response.json();

    console.log("🔍 세션 데이터:", sessionData);

    // 세션 없음
    if (!response.ok || !sessionData.user) {
      console.log("❌ 세션 없음 - 회원가입 페이지로 이동");
      router.push("/signup?error=session_expired");
      return;
    }

    // 소셜 로그인은 이 페이지에 올 수 없음 (서버에서 리다이렉트됨)
    if (isSocialSignup(sessionData)) {
      console.log("⚠️ 소셜 로그인 - 잘못된 경로, 회원가입 페이지로 이동");
      router.push("/signup");
      return;
    }

    // 웰니스 회원가입 처리
    if (isWellnessSignup(sessionData)) {
      console.log("✅ 세션 확인 완료, 폼 표시");
      setIsVerifying(false);
      return;
    }

    // 본인인증 미완료
    console.log("⚠️ 본인인증 미완료, /verify로 리다이렉트");
    router.push("/verify");
  };

  return {
    isVerifying,
    hasProcessed,
  };
}
