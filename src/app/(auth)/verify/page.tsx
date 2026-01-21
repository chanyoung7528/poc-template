"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PassAuthButton } from "@/domains/auth/ui/signup/PassAuthButton";
import styles from "./page.module.scss";
import { usePortOnePass } from "@/features/auth/hooks/usePortOnePass";

// Dynamic rendering 강제 (useSearchParams 사용으로 인해 필요)
export const dynamic = "force-dynamic";

// 실제 페이지 컴포넌트 (useSearchParams 사용)
function VerifyPageContent() {
  const searchParams = useSearchParams();
  const { handleAuth, isLoading, handleRedirectResult } = usePortOnePass();
  const [isVerifying, setIsVerifying] = useState(false);
  const [hasProcessedRedirect, setHasProcessedRedirect] = useState(false); // 리다이렉트 처리 플래그

  // 웹뷰에서 리다이렉트로 돌아온 경우 처리
  useEffect(() => {
    // 이미 처리했으면 무시
    if (hasProcessedRedirect) {
      console.log("ℹ️ 이미 리다이렉트 결과를 처리했습니다.");
      return;
    }

    const impUid = searchParams.get("imp_uid");
    const impSuccess =
      searchParams.get("imp_success") || searchParams.get("success"); // imp_success 또는 success
    const errorMsg = searchParams.get("error_msg");

    console.log("📱 URL 파라미터 확인:", {
      imp_uid: impUid,
      imp_success: searchParams.get("imp_success"),
      success: searchParams.get("success"),
      error_msg: errorMsg,
      allParams: Object.fromEntries(searchParams.entries()),
    });

    if (impUid || impSuccess !== null) {
      console.log("📱 본인인증 리다이렉트 결과:", {
        imp_uid: impUid,
        imp_success: impSuccess,
        error_msg: errorMsg,
      });

      setIsVerifying(true);
      setHasProcessedRedirect(true); // 처리 시작 플래그 설정

      // 리다이렉트 결과 처리
      if (handleRedirectResult) {
        console.log("📱 handleRedirectResult 호출");
        handleRedirectResult({
          success: impSuccess === "true",
          imp_uid: impUid || undefined,
          error_msg: errorMsg || undefined,
        });
      } else {
        console.error("❌ handleRedirectResult가 없습니다");
      }
    } else {
      console.log("ℹ️ 본인인증 리다이렉트 파라미터 없음 - 일반 페이지 접근");
    }
  }, [searchParams, hasProcessedRedirect]); // handleRedirectResult 제거

  const handlePassAuth = () => {
    setIsVerifying(true);

    try {
      // PASS 인증 SDK 호출 - 콜백에서 자동으로 처리됨
      console.log("PASS 인증 시작");
      handleAuth();

      // handleAuth는 아임포트 SDK를 호출하고 콜백에서 결과를 처리합니다
      // 여기서는 로딩 상태만 관리하고, 실제 결과 처리는 usePortOnePass 훅 내부에서 수행됩니다
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

          {(isVerifying || isLoading) && (
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
export default function VerifyPage() {
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
      <VerifyPageContent />
    </Suspense>
  );
}
