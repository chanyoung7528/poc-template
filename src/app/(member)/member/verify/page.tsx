/**
 * Page: Member - 본인인증
 * 
 * 역할: PASS 본인인증 페이지
 */

"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PassAuthButton } from "@/domains/auth/ui/signup/PassAuthButton";
import styles from "./page.module.scss";
import { useGeneralSignupFlow, useCredentialsAuth } from "@/features/member/hooks";

// Dynamic rendering 강제
export const dynamic = "force-dynamic";

// 실제 페이지 컴포넌트
function MemberVerifyPageContent() {
  const searchParams = useSearchParams();
  const { handleVerificationComplete, isCheckingStatus } = useGeneralSignupFlow();
  const { startPassAuth, isAuthenticating } = useCredentialsAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasProcessedRedirect, setHasProcessedRedirect] = useState(false);

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
        // ✅ 본인인증 성공 → transactionId로 회원 상태 조회
        handleVerificationComplete(impUid);
      } else {
        alert(errorMsg || "본인인증에 실패했습니다");
        setIsVerifying(false);
      }
    }
  }, [searchParams, hasProcessedRedirect, handleVerificationComplete]);

  const handlePassAuth = () => {
    setIsVerifying(true);

    try {
      startPassAuth(async (transactionId) => {
        // PASS 인증 완료 → transactionId로 회원 상태 조회
        await handleVerificationComplete(transactionId);
        setIsVerifying(false);
      });
    } catch (error) {
      console.error("본인인증 중 오류:", error);
      alert("본인인증 중 오류가 발생했습니다. 다시 시도해주세요.");
      setIsVerifying(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.content}>
          <h1 className={styles.title}>PASS 인증</h1>
          <p className={styles.subtitle}>
            본인 인증을 위해 PASS 인증을 진행해주세요
          </p>

          <div className={styles.passSection}>
            <PassAuthButton onClick={handlePassAuth} />
          </div>

          <div className={styles.note}>
            <p className={styles.noteText}>
              * PASS 앱이 설치되어 있어야 합니다
            </p>
            <p className={styles.noteText}>
              * 인증 완료 후 자동으로 다음 단계로 진행됩니다
            </p>
          </div>

          {(isVerifying || isAuthenticating || isCheckingStatus) && (
            <div className={styles.loadingOverlay}>
              <p>본인인증 처리 중...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Suspense로 감싼 메인 컴포넌트
export default function MemberVerifyPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.content}>
              <div className={styles.loadingOverlay}>
                <p>로딩 중...</p>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <MemberVerifyPageContent />
    </Suspense>
  );
}
