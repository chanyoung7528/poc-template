/**
 * Page: Member - Signup (auth 스타일 적용)
 * 
 * 역할: 회원가입 페이지
 */

"use client";

import { SignupTitle } from "@/domains/auth/ui/signup/SignupTitle";
import { SocialLoginButtons } from "@/domains/auth/ui/signup/button/SocialLoginButtons";
import styles from "./page.module.scss";
import { useRouter } from "next/navigation";
import { useGeneralSignupFlow, useSnsAuthFlow } from "@/features/member/hooks";
import { useMemberStore } from "@/domains/member/model";

export default function MemberSignupPage() {
  const router = useRouter();
  const memberStore = useMemberStore();

  const { handleVerificationComplete } = useGeneralSignupFlow();
  const { handleSnsLoginSuccess } = useSnsAuthFlow();

  // Wellness ID (일반 회원가입)
  const handleWellnessId = async () => {
    memberStore.clearAllTokens();
    
    // 약관 동의 페이지로 이동
    router.push("/member/terms-agreement");
  };

  // 카카오 간편가입
  const handleKakao = async () => {
    memberStore.clearAllTokens();
    
    // TODO: 카카오 로그인 SDK 호출
    // 성공 시 handleSnsLoginSuccess 호출
    console.log("카카오 로그인 시작");
  };

  // 네이버 간편가입
  const handleNaver = async () => {
    memberStore.clearAllTokens();
    
    // TODO: 네이버 로그인 SDK 호출
    console.log("네이버 로그인 시작");
  };

  // 애플 간편가입
  const handleApple = async () => {
    memberStore.clearAllTokens();
    
    // TODO: 애플 로그인 SDK 호출
    console.log("애플 로그인 시작");
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
