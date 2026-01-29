/**
 * Page: Member - 약관 동의
 *
 * 역할: 약관 동의 페이지 (일반 & SNS 공통)
 * - Store에 약관 동의 데이터 저장
 * - 약관 동의 완료 후 바로 PortOne 본인인증 시작
 * - API 통신 X
 */

"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { TermsAgreement } from "@/domains/agreement/ui/TermsAgreement";
import { TermsAgreementTitle } from "@/domains/agreement/ui/TermsAgreementTitle";
import { useGeneralSignupFlow } from "@/features/member/hooks/useGeneralSignupFlow";
import { useSnsSignupFlow } from "@/features/member/hooks/useSnsSignupFlow";
import { useCredentialsAuth } from "@/features/member/hooks/useCredentialsAuth";
import type { Agreement } from "@/domains/member/model";

// Dynamic rendering 강제
export const dynamic = "force-dynamic";

function MemberTermsAgreementContent() {
  const searchParams = useSearchParams();
  const signupType = searchParams.get("type") || "general"; // "general" or "sns"

  const generalFlow = useGeneralSignupFlow();
  const snsFlow = useSnsSignupFlow();
  const { startPassAuth, isAuthenticating } = useCredentialsAuth();

  const handleSubmit = async (agreements: Agreement[]) => {
    console.log("📋 약관 동의 제출:", agreements);
    console.log("📋 agreements 길이:", agreements.length);
    
    // agreements 검증
    if (!agreements || agreements.length === 0) {
      console.error("❌ agreements가 비어있습니다!");
      return;
    }

    // 1. 약관 동의 Store에 저장
    if (signupType === "sns") {
      snsFlow.handleAgreements(agreements);
    } else {
      generalFlow.handleAgreements(agreements);
      console.log("✅ 일반 회원가입 약관 저장 완료");
    }

    // 2. 약관 동의 완료 후 바로 PortOne 본인인증 시작
    // 일반 브라우저: 콜백으로 처리
    // 웹뷰: 리다이렉트로 /auth/signup/credentials 이동
    try {
      await startPassAuth(async (transactionId) => {
        // PortOne 인증 완료 후 처리 (일반 브라우저만)
        if (signupType === "sns") {
          await snsFlow.handleVerificationComplete(transactionId);
        } else {
          await generalFlow.handleVerificationComplete(transactionId);
        }
      });
    } catch (error) {
      console.error("본인인증 시작 중 오류:", error);
    }
  };

  const isLoading = isAuthenticating || generalFlow.isLoading || snsFlow.isLoading;

  return (
    <>
      <TermsAgreementTitle />
      <TermsAgreement onSubmit={handleSubmit} showError={false} />
      
      {isLoading && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}>
          <div style={{
            background: "white",
            padding: "2rem",
            borderRadius: "8px",
            textAlign: "center",
          }}>
            <p>본인인증 처리 중...</p>
          </div>
        </div>
      )}
    </>
  );
}

export default function MemberTermsAgreementPage() {
  return (
    <Suspense fallback={<div>로딩 중...</div>}>
      <MemberTermsAgreementContent />
    </Suspense>
  );
}
