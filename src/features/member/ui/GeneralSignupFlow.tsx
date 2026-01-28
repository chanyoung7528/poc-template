/**
 * Feature UI: Member - 일반 회원가입 플로우
 *
 * 역할: 일반 회원가입 UI 흐름
 * - Domain UI 조합
 * - Feature hook 사용
 */

"use client";

import { useState } from "react";
import {
  useGeneralSignupFlow,
  useCredentialsAuth,
} from "@/features/member/hooks";
import { PassAuthButton } from "@/domains/member/ui";
import styles from "./GeneralSignupFlow.module.scss";

type SignupStep = "pass-auth" | "credentials";

export function GeneralSignupFlow() {
  const [step, setStep] = useState<SignupStep>("pass-auth");

  const { handleVerificationComplete, isCheckingStatus } =
    useGeneralSignupFlow();
  const { startPassAuth, isAuthenticating } = useCredentialsAuth();

  const handlePassAuth = () => {
    startPassAuth(async (transactionId) => {
      await handleVerificationComplete(transactionId);
    });
  };

  if (step === "pass-auth") {
    return (
      <div className={styles.passAuthStep}>
        <div className={styles.description}>
          <h2>본인인증이 필요합니다</h2>
          <p>PASS 본인인증을 통해 안전하게 회원가입하세요</p>
        </div>

        <PassAuthButton
          onClick={handlePassAuth}
          isLoading={isAuthenticating || isCheckingStatus}
        />

        <div className={styles.notice}>
          <p>✓ 만 14세 이상만 가입 가능합니다</p>
          <p>✓ 본인인증 정보는 안전하게 암호화됩니다</p>
        </div>
      </div>
    );
  }

  return null;
}
