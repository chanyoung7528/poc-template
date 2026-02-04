/**
 * Feature: Auth - 회원가입 페이지 진입점
 *
 * 역할: 회원가입 페이지의 모든 진입점 제공
 * - Wellness ID (일반) 회원가입 시작
 * - SNS 로그인 시작 (카카오, 네이버, 애플)
 * 
 * 페이지 복잡도 감소를 위해 비즈니스 로직을 분리
 */

"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { useSnsSignupFlow } from "./useSnsSignupFlow";

export function useAuthSignupPage() {
  const router = useRouter();
  const authStore = useAuthStore();
  const snsFlow = useSnsSignupFlow();

  /**
   * Wellness ID (일반) 회원가입 시작
   * - Store에 일반 회원가입 상태 저장
   * - 약관 동의 페이지로 이동
   */
  const handleWellnessIdSignup = async () => {
    // Store에 일반 회원가입 시작 상태 저장
    authStore.startSignup("wellness");

    // 일반 회원가입 모드로 세션 시작
    try {
      const response = await fetch("/api/auth/wellness/init", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("일반 회원가입 초기화 실패:", data.error);
        throw new Error(data.error || "회원가입 초기화에 실패했습니다");
      }

      console.log("✅ 일반 회원가입 모드 시작");
      // 약관 동의 페이지로 이동
      router.push("/terms-agreement");
    } catch (error) {
      console.error("일반 회원가입 초기화 중 오류:", error);
      throw error;
    }
  };

  /**
   * 카카오 로그인 시작
   * - SNS 플로우로 위임
   */
  const handleKakaoSignup = () => {
    authStore.startSignup("kakao");
    snsFlow.handleSnsLogin("kakao");
  };

  /**
   * 네이버 로그인 시작
   * - SNS 플로우로 위임
   */
  const handleNaverSignup = () => {
    authStore.startSignup("naver");
    snsFlow.handleSnsLogin("naver");
  };

  /**
   * 애플 로그인 시작
   * - SNS 플로우로 위임
   */
  const handleAppleSignup = () => {
    authStore.startSignup("apple");
    snsFlow.handleSnsLogin("apple");
  };

  return {
    handleWellnessIdSignup,
    handleKakaoSignup,
    handleNaverSignup,
    handleAppleSignup,
    isLoading: snsFlow.isLoading,
    error: snsFlow.error,
  };
}
