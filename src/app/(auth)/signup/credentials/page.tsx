"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCredentialsAuth as useAuthCredentialsAuth } from "@/features/auth/hooks/useCredentialsAuth";
import { useCredentialsAuth as useMemberCredentialsAuth } from "@/features/member/hooks/useCredentialsAuth";
import { useWellnessSignup } from "@/features/auth/hooks/useWellnessSignup";
import { useGeneralSignupFlow } from "@/features/member/hooks/useGeneralSignupFlow";
import { CredentialsForm } from "@/domains/auth/ui/signup/CredentialsForm";
import { LoadingOverlay } from "@/domains/auth/ui/common/LoadingOverlay";

// Dynamic rendering 강제
export const dynamic = "force-dynamic";

function CredentialsPageContent() {
  const searchParams = useSearchParams();
  const { isVerifying } = useAuthCredentialsAuth();
  const { handleRedirectResult } = useMemberCredentialsAuth();
  const { isSubmitting, handleSubmit, handleDuplicateCheck } =
    useWellnessSignup();
  const generalFlow = useGeneralSignupFlow();
  
  const [hasProcessedRedirect, setHasProcessedRedirect] = useState(false);

  // PortOne 리다이렉트 결과 처리 (member 플로우)
  useEffect(() => {
    if (hasProcessedRedirect) {
      return;
    }

    const impUid = searchParams.get("imp_uid");
    const impSuccess = searchParams.get("imp_success") || searchParams.get("success");
    const errorMsg = searchParams.get("error_msg");

    if (impUid || impSuccess !== null) {
      console.log("📱 본인인증 리다이렉트 결과 (credentials 페이지):", {
        imp_uid: impUid,
        imp_success: impSuccess,
        error_msg: errorMsg,
      });

      setHasProcessedRedirect(true);

      if (impSuccess === "true" && impUid) {
        // ✅ 본인인증 성공 → transactionId로 처리 (member 플로우)
        const transactionId = handleRedirectResult({
          success: true,
          imp_uid: impUid,
        });

        if (transactionId) {
          // member 플로우 처리
          generalFlow.handleVerificationComplete(transactionId);
        }
      } else {
        handleRedirectResult({
          success: false,
          error_msg: errorMsg || undefined,
        });
      }
    }
  }, [searchParams, hasProcessedRedirect, generalFlow, handleRedirectResult]);

  if (isVerifying || hasProcessedRedirect) {
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
