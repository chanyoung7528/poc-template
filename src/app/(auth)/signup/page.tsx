"use client";

import { SignupTitle } from "@/domains/auth/ui/signup/SignupTitle";
import { SocialLoginButtons } from "@/domains/auth/ui/signup/button/SocialLoginButtons";
import styles from "./page.module.scss";
import { useAuthSignupPage } from "@/features/auth/hooks/useAuthSignupPage";
import { toast } from "sonner";

/**
 * 회원가입 페이지
 * 
 * 역할: UI 렌더링만 담당
 * - 모든 비즈니스 로직은 useAuthSignupPage 훅에 위임
 */
export default function SignupPage() {
  const {
    handleWellnessIdSignup,
    handleKakaoSignup,
    handleNaverSignup,
    handleAppleSignup,
    isLoading,
  } = useAuthSignupPage();

  // 에러 핸들링을 위한 래퍼
  const handleWellnessId = async () => {
    try {
      await handleWellnessIdSignup();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "오류가 발생했습니다");
    }
  };

  return (
    <>
      <SignupTitle />
      <div className={styles.buttonContainer}>
        <SocialLoginButtons
          onWellnessId={handleWellnessId}
          onKakao={handleKakaoSignup}
          onNaver={handleNaverSignup}
          onApple={handleAppleSignup}
          disabled={isLoading}
        />
      </div>
    </>
  );
}
