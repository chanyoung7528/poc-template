/**
 * Feature: Member - 회원가입 페이지 플로우
 *
 * 역할: 회원가입 페이지의 모든 비즈니스 로직
 * - Wellness ID 회원가입 시작
 * - SNS 로그인 시작 (카카오, 네이버, 애플)
 */

import { useRouter } from "next/navigation";
import { useSnsSignupFlow } from "./useSnsSignupFlow";

export function useMemberSignupPage() {
  const router = useRouter();
  const snsFlow = useSnsSignupFlow();

  /**
   * Wellness ID 회원가입 시작
   * - 약관 동의 페이지로 이동
   */
  const handleWellnessIdSignup = () => {
    router.push("/member/terms-agreement?type=general");
  };

  /**
   * 카카오 로그인 시작
   * - 카카오 SDK 연동 후 accessToken 받아서 처리
   */
  const handleKakaoLogin = async () => {
    // TODO: 카카오 SDK 연동
    console.log("카카오 로그인 시작");

    // Mock: 카카오 로그인 성공 후
    const mockAccessToken = "kakao_mock_token_12345";
    await snsFlow.handleSnsLoginComplete("KAKAO", mockAccessToken);
  };

  /**
   * 네이버 로그인 시작
   * - 네이버 SDK 연동 후 accessToken 받아서 처리
   */
  const handleNaverLogin = async () => {
    // TODO: 네이버 SDK 연동
    console.log("네이버 로그인 시작");

    // Mock: 네이버 로그인 성공 후
    const mockAccessToken = "naver_mock_token_12345";
    await snsFlow.handleSnsLoginComplete("NAVER", mockAccessToken);
  };

  /**
   * 애플 로그인 시작
   * - 애플 SDK 연동 후 accessToken 받아서 처리
   */
  const handleAppleLogin = async () => {
    // TODO: 애플 SDK 연동
    console.log("애플 로그인 시작");

    // Mock: 애플 로그인 성공 후
    const mockAccessToken = "apple_mock_token_12345";
    await snsFlow.handleSnsLoginComplete("APPLE", mockAccessToken);
  };

  return {
    handleWellnessIdSignup,
    handleKakaoLogin,
    handleNaverLogin,
    handleAppleLogin,
    isLoading: snsFlow.isLoading,
  };
}
