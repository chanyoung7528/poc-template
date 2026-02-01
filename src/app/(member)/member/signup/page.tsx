/**
 * Page: Member - 회원가입 방식 선택
 *
 * 역할: Wellness ID / SNS 회원가입 선택
 * - 비즈니스 로직은 Feature hook에 위임
 */

"use client";

import { SignupTitle } from "@/domains/member/ui/signup/SignupTitle";
import { SocialLoginButtons } from "@/domains/auth/ui/signup/button/SocialLoginButtons";
import { useMemberSignupPage } from "@/features/member/hooks/useMemberSignupPage";
import styles from "./page.module.scss";

export default function MemberSignupPage() {
  const {
    handleWellnessIdSignup,
    handleKakaoLogin,
    handleNaverLogin,
    handleAppleLogin,
    isLoading,
  } = useMemberSignupPage();

  return (
    <>
      <SignupTitle />
      <div className={styles.container}>
        {/* Wellness ID + SNS 간편 가입 */}
        <SocialLoginButtons
          onWellnessId={handleWellnessIdSignup}
          onKakao={handleKakaoLogin}
          onNaver={handleNaverLogin}
          onApple={handleAppleLogin}
          disabled={isLoading}
        />
      </div>
    </>
  );
}
