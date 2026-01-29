/**
 * Page: Member - 회원가입 방식 선택
 *
 * 역할: Wellness ID / SNS 회원가입 선택
 */

"use client";

import { useRouter } from "next/navigation";
import { SignupTitle } from "@/domains/member/ui/signup/SignupTitle";
import { SocialLoginButtons } from "@/domains/auth/ui/signup/button/SocialLoginButtons";
import { useSnsSignupFlow } from "@/features/member/hooks/useSnsSignupFlow";
import styles from "./page.module.scss";

export default function MemberSignupPage() {
  const router = useRouter();
  const snsFlow = useSnsSignupFlow();

  // Wellness ID 회원가입 (일반 회원가입)
  const handleWellnessIdSignup = () => {
    router.push("/member/terms-agreement?type=general");
  };

  // SNS 로그인 (카카오, 네이버, 애플)
  const handleKakaoLogin = async () => {
    // TODO: 카카오 SDK 연동
    console.log("카카오 로그인 시작");

    // Mock: 카카오 로그인 성공 후
    const mockAccessToken = "kakao_mock_token_12345";
    await snsFlow.handleSnsLoginComplete("KAKAO", mockAccessToken);
  };

  const handleNaverLogin = async () => {
    // TODO: 네이버 SDK 연동
    console.log("네이버 로그인 시작");

    // Mock: 네이버 로그인 성공 후
    const mockAccessToken = "naver_mock_token_12345";
    await snsFlow.handleSnsLoginComplete("NAVER", mockAccessToken);
  };

  const handleAppleLogin = async () => {
    // TODO: 애플 SDK 연동
    console.log("애플 로그인 시작");

    // Mock: 애플 로그인 성공 후
    const mockAccessToken = "apple_mock_token_12345";
    await snsFlow.handleSnsLoginComplete("APPLE", mockAccessToken);
  };

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
        />
      </div>
    </>
  );
}
