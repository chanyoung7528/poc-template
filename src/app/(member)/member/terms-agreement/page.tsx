/**
 * Page: Member - 약관 동의
 *
 * 역할: 약관 동의 페이지 (일반 & SNS 공통)
 * - 비즈니스 로직은 Feature hook에 위임
 */

"use client";

import { Suspense } from "react";
import { TermsAgreement } from "@/domains/agreement/ui/TermsAgreement";
import { TermsAgreementTitle } from "@/domains/agreement/ui/TermsAgreementTitle";
import { useTermsAgreementPage } from "@/features/member/hooks/useTermsAgreementPage";

// Dynamic rendering 강제
export const dynamic = "force-dynamic";

function MemberTermsAgreementContent() {
  const { handleSubmit, isLoading } = useTermsAgreementPage();

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
