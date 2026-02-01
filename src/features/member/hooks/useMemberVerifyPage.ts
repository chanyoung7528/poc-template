/**
 * Hook: useMemberVerifyPage
 *
 * 역할: 본인인증 페이지 로직
 * - PortOne SDK를 사용하여 본인인증
 * - 웹뷰/일반 브라우저 모두 지원
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useGeneralSignupFlow } from "./useGeneralSignupFlow";
import { useSnsSignupFlow } from "./useSnsSignupFlow";
import { useCredentialsAuth } from "./useCredentialsAuth";

export function useMemberVerifyPage() {
  const searchParams = useSearchParams();
  const signupType = searchParams.get("type") || "general"; // "general" or "sns"

  const generalFlow = useGeneralSignupFlow();
  const snsFlow = useSnsSignupFlow();
  const { startPassAuth, handleRedirectResult, isAuthenticating } =
    useCredentialsAuth();

  const [isVerifying, setIsVerifying] = useState(false);
  const [hasProcessedRedirect, setHasProcessedRedirect] = useState(false);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);

  // 웹뷰에서 리다이렉트로 돌아온 경우 처리
  useEffect(() => {
    if (hasProcessedRedirect) {
      return;
    }

    const impUid = searchParams.get("imp_uid");
    const impSuccess =
      searchParams.get("imp_success") || searchParams.get("success");
    const errorMsg = searchParams.get("error_msg");

    if (impUid || impSuccess !== null) {
      console.log("📱 본인인증 리다이렉트 결과:", {
        imp_uid: impUid,
        imp_success: impSuccess,
        error_msg: errorMsg,
      });

      setIsVerifying(true);
      setHasProcessedRedirect(true);

      if (impSuccess === "true" && impUid) {
        // ✅ 본인인증 성공 → transactionId로 처리
        const transactionId = handleRedirectResult({
          success: true,
          imp_uid: impUid,
        });

        if (transactionId) {
          if (signupType === "sns") {
            snsFlow.handleVerificationComplete(transactionId);
          } else {
            generalFlow.handleVerificationComplete(transactionId);
          }
        }
      } else {
        handleRedirectResult({
          success: false,
          error_msg: errorMsg || undefined,
        });
        setIsVerifying(false);
      }
      return; // 리다이렉트 처리했으면 자동 시작하지 않음
    }

    // 리다이렉트가 아닌 경우: 약관 동의 후 자동으로 본인인증 시작
    if (!hasAutoStarted && !hasProcessedRedirect) {
      setHasAutoStarted(true);
      setIsVerifying(true);

      startPassAuth(async (transactionId) => {
        // PortOne 인증 완료 → transactionId로 처리
        if (signupType === "sns") {
          await snsFlow.handleVerificationComplete(transactionId);
        } else {
          await generalFlow.handleVerificationComplete(transactionId);
        }
        setIsVerifying(false);
      });
    }
  }, [
    searchParams,
    hasProcessedRedirect,
    hasAutoStarted,
    signupType,
    generalFlow,
    snsFlow,
    handleRedirectResult,
    startPassAuth,
  ]);

  const handlePassAuth = () => {
    setIsVerifying(true);

    try {
      startPassAuth(async (transactionId) => {
        // PortOne 인증 완료 → transactionId로 처리
        if (signupType === "sns") {
          await snsFlow.handleVerificationComplete(transactionId);
        } else {
          await generalFlow.handleVerificationComplete(transactionId);
        }
        setIsVerifying(false);
      });
    } catch (error) {
      console.error("본인인증 중 오류:", error);
      setIsVerifying(false);
    }
  };

  const isLoading =
    isVerifying ||
    isAuthenticating ||
    generalFlow.isLoading ||
    snsFlow.isLoading;

  return {
    handlePassAuth,
    isLoading,
  };
}
