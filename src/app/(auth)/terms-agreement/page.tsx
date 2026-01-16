"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { TermsAgreement } from "@/domains/auth/ui/terms-agreement/TermsAgreement";
import { TermsAgreementTitle } from "@/domains/auth/ui/terms-agreement/TermsAgreementTitle";
import { useAuthStore } from "@/store/authStore";

export default function TermsAgreementPage() {
  const router = useRouter();
  const [agreedState, setAgreedState] = useState({
    terms: false,
    privacy: false,
    marketing: false,
  });

  // Zustand Store 사용
  const agreeToTerms = useAuthStore((state) => state.agreeToTerms);

  const handleAgree = (agreed: {
    terms: boolean;
    privacy: boolean;
    marketing: boolean;
  }) => {
    setAgreedState(agreed);
  };

  const handleSubmit = async () => {
    if (!agreedState.terms || !agreedState.privacy) {
      console.error("필수 약관에 동의해주세요.");
      return;
    }

    try {
      // 약관 동의 상태를 세션에 업데이트
      const response = await fetch("/api/auth/update-terms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          termsAgreed: agreedState.terms,
          privacyAgreed: agreedState.privacy,
          marketingAgreed: agreedState.marketing,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("약관 동의 업데이트 실패:", data.error);

        // 에러 타입에 따라 처리
        if (data.error === "unauthorized") {
          // 세션이 없음 - 다시 로그인
          router.push("/login?error=session_expired");
        } else if (data.error === "already_registered") {
          // 이미 가입된 사용자
          router.push("/main");
        } else {
          // 기타 에러
          alert("오류가 발생했습니다. 다시 시도해주세요.");
        }
        return;
      }

      console.log("✅ 약관 동의 완료, 본인인증 페이지로 이동");

      // Zustand Store 업데이트
      agreeToTerms();

      // 본인인증 페이지로 이동
      router.push("/verify");
    } catch (error) {
      console.error("약관 동의 요청 중 오류:", error);
      alert("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <>
      <TermsAgreementTitle />
      <TermsAgreement
        onAgree={handleAgree}
        onSubmit={handleSubmit}
        showError={false}
      />
    </>
  );
}
