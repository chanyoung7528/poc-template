"use client";

import { Suspense } from "react";
import { useCredentialsAuth } from "@/features/auth/hooks/useCredentialsAuth";
import { useWellnessSignup } from "@/features/auth/hooks/useWellnessSignup";
import { CredentialsForm } from "@/domains/auth/ui/signup/CredentialsForm";
import { LoadingOverlay } from "@/domains/auth/ui/common/LoadingOverlay";

function CredentialsPageContent() {
  const { isVerifying } = useCredentialsAuth();
  const { isSubmitting, handleSubmit, handleDuplicateCheck } =
    useWellnessSignup();

  if (isVerifying) {
    return <LoadingOverlay message="본인인증 처리 중..." />;
  }

  return (
    <CredentialsForm
      isSubmitting={isSubmitting}
      onSubmit={handleSubmit}
      onDuplicateCheck={handleDuplicateCheck}
    />
  );
}

export default function CredentialsPage() {
  return (
    <Suspense fallback={<LoadingOverlay />}>
      <CredentialsPageContent />
    </Suspense>
  );
}
