/**
 * Page: Member - 회원가입 정보 입력
 *
 * 역할: 아이디/비밀번호 입력 페이지 (일반 회원가입만)
 * - 비즈니스 로직은 Feature hook에 위임
 */

"use client";

import { Suspense } from "react";
import { useCredentialsPage } from "@/features/member/hooks/useCredentialsPage";
import { CredentialsForm } from "@/domains/auth/ui/signup/CredentialsForm";
import { LoadingOverlay } from "@/domains/auth/ui/common/LoadingOverlay";

// Dynamic rendering 강제
export const dynamic = "force-dynamic";

function CredentialsPageContent() {
  const { handleSubmit, isLoading } = useCredentialsPage();

  // WellnessIdInput이 내부에서 자동으로 중복 체크하므로 onDuplicateCheck 불필요
  return (
    <CredentialsForm
      onSubmit={handleSubmit}
      isSubmitting={isLoading}
    />
  );
}

export default function MemberSignupCredentialsPage() {
  return (
    <Suspense fallback={<LoadingOverlay />}>
      <CredentialsPageContent />
    </Suspense>
  );
}
