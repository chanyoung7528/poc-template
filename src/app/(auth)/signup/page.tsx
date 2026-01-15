"use client";

import { SignupTitle } from "@/domains/auth/ui/signup/SignupTitle";
import { SocialLoginButtons } from "@/domains/auth/ui/signup/button/SocialLoginButtons";
import styles from "./page.module.scss";

export default function SignupPage() {
  const handleWellnessId = () => {
    // Wellness ID 회원가입 처리
    console.log("Wellness ID 회원가입");
  };

  const handleKakao = () => {
    // 카카오 로그인 처리
    window.location.href = "/api/auth/kakao";
  };

  const handleNaver = () => {
    // 네이버 로그인 처리
    window.location.href = "/api/auth/naver";
  };

  const handleApple = () => {
    // Apple 로그인 처리
    console.log("Apple 로그인");
  };

  return (
    <>
      <SignupTitle />
      <div className={styles.buttonContainer}>
        <SocialLoginButtons
          onWellnessId={handleWellnessId}
          onKakao={handleKakao}
          onNaver={handleNaver}
          onApple={handleApple}
        />
      </div>
    </>
  );
}
