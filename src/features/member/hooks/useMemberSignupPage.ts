/**
 * Feature: Member - 회원가입 페이지 플로우
 *
 * 역할: 회원가입 페이지의 모든 비즈니스 로직
 * - Wellness ID 회원가입 시작
 * - SNS 로그인 시작 (카카오, 네이버, 애플)
 * 
 * 네이티브 앱 통신:
 * - 플러터 앱과 웹뷰 간 브리지 통신 지원
 * - 웹 환경에서는 OAuth로 자동 폴백
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
   * - 네이티브 앱: 플러터 브리지로 요청
   * - 웹: OAuth로 폴백
   */
  const handleKakaoLogin = () => {
    snsFlow.handleSnsLogin("kakao");
  };

  /**
   * 네이버 로그인 시작
   * - 네이티브 앱: 플러터 브리지로 요청
   * - 웹: OAuth로 폴백
   */
  const handleNaverLogin = () => {
    snsFlow.handleSnsLogin("naver");
  };

  /**
   * 애플 로그인 시작
   * - 네이티브 앱: 플러터 브리지로 요청
   * - 웹: OAuth로 폴백
   */
  const handleAppleLogin = () => {
    snsFlow.handleSnsLogin("apple");
  };

  return {
    handleWellnessIdSignup,
    handleKakaoLogin,
    handleNaverLogin,
    handleAppleLogin,
    isLoading: snsFlow.isLoading,
  };
}
