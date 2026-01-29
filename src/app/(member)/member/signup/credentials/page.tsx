/**
 * Page: Member - 회원가입 정보 입력
 *
 * 역할: 아이디/비밀번호 입력 페이지 (일반 회원가입만)
 * - PortOne 리다이렉트 결과 처리
 * - checkUserStatus API 호출하여 verificationToken 받기
 */

"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useGeneralSignupFlow } from "@/features/member/hooks/useGeneralSignupFlow";
import { useMemberStore } from "@/domains/member/model";
import { useCredentialsAuth } from "@/features/member/hooks/useCredentialsAuth";
import { CredentialsForm } from "@/domains/auth/ui/signup/CredentialsForm";
import { LoadingOverlay } from "@/domains/auth/ui/common/LoadingOverlay";
import styles from "./page.module.scss";

// Dynamic rendering 강제
export const dynamic = "force-dynamic";

function CredentialsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // selector를 사용하여 verificationToken 구독 (리렌더링 트리거)
  const verificationToken = useMemberStore((state) => state.verificationToken);
  const { handleRegister, handleVerificationComplete, isLoading } =
    useGeneralSignupFlow();
  const { handleRedirectResult } = useCredentialsAuth();

  const [hasProcessedRedirect, setHasProcessedRedirect] = useState(false);
  const [isProcessingVerification, setIsProcessingVerification] =
    useState(false);

  // PortOne 리다이렉트 결과 처리 (웹뷰 환경)
  useEffect(() => {
    if (hasProcessedRedirect) {
      return;
    }

    const impUid = searchParams.get("imp_uid");
    const impSuccess =
      searchParams.get("imp_success") || searchParams.get("success");
    const errorMsg = searchParams.get("error_msg");

    if (impUid || impSuccess !== null) {
      console.log("📱 본인인증 리다이렉트 결과 (credentials 페이지):", {
        imp_uid: impUid,
        imp_success: impSuccess,
        error_msg: errorMsg,
      });

      setHasProcessedRedirect(true);
      setIsProcessingVerification(true);

      if (impSuccess === "true" && impUid) {
        // ✅ 본인인증 성공 → checkUserStatus API 호출하여 verificationToken 받기
        handleVerificationComplete(impUid)
          .then(() => {
            // verificationToken은 Store에 저장되었고, 컴포넌트가 리렌더링되면서 자동으로 확인됨
            console.log("✅ 본인인증 처리 완료");
            setIsProcessingVerification(false);
          })
          .catch((error) => {
            console.error("본인인증 처리 실패:", error);
            setIsProcessingVerification(false);
            router.push("/member/terms-agreement?type=general");
          });
      } else {
        handleRedirectResult({
          success: false,
          error_msg: errorMsg || undefined,
        });
        setIsProcessingVerification(false);
        router.push("/member/terms-agreement?type=general");
      }
      return; // 리다이렉트 처리했으면 아래 검증 스킵
    }

    // verificationToken이 없으면 본인인증으로 (리다이렉트가 아닌 경우)
    if (!verificationToken && !isProcessingVerification) {
      router.push("/member/terms-agreement?type=general");
    }
  }, [
    searchParams,
    hasProcessedRedirect,
    verificationToken,
    isProcessingVerification,
    handleVerificationComplete,
    handleRedirectResult,
    router,
  ]);

  const handleSubmit = async (data: {
    wellnessId: string;
    password: string;
    passwordConfirm: string;
  }) => {
    await handleRegister(data.wellnessId, data.password);
  };

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
