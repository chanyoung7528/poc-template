/**
 * Page: Member - 본인인증
 *
 * 역할: PortOne 본인인증 페이지 (일반 & SNS 공통)
 * - 비즈니스 로직은 Feature hook에 위임
 */

"use client";

import { Suspense } from "react";
import { PassAuthButton } from "@/domains/auth/ui/signup/PassAuthButton";
import styles from "./page.module.scss";
import { useMemberVerifyPage } from "@/features/member/hooks/useMemberVerifyPage";

// Dynamic rendering 강제
export const dynamic = "force-dynamic";

// 실제 페이지 컴포넌트
function MemberVerifyPageContent() {
  const { handlePassAuth, isLoading } = useMemberVerifyPage();

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

          {isLoading && (
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
