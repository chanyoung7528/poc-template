/**
 * Feature: Auth - 로그인 페이지 진입점
 *
 * 역할: 로그인 페이지의 모든 진입점 제공
 * - 일반 로그인 (Wellness ID + 비밀번호)
 * - SNS 로그인 (카카오, 네이버, 애플)
 * - 비밀번호 찾기
 * 
 * 페이지 복잡도 감소를 위해 비즈니스 로직을 분리
 */

"use client";

import { useState } from "react";
import { useGeneralLoginFlow } from "./useGeneralLoginFlow";
import { useSnsLoginFlow } from "./useSnsLoginFlow";

export type LoginStep = "login" | "find-id" | "reset-password";

interface UseAuthLoginPageReturn {
  currentStep: LoginStep;
  isLoading: boolean;
  error: string | null;
  
  // 일반 로그인
  handleLogin: (wellnessId: string, password: string) => Promise<void>;
  
  // SNS 로그인
  handleKakaoLogin: () => void;
  handleNaverLogin: () => void;
  handleAppleLogin: () => void;
  
  // 단계 전환
  setStep: (step: LoginStep) => void;
  clearError: () => void;
}

export function useAuthLoginPage(): UseAuthLoginPageReturn {
  const [currentStep, setCurrentStep] = useState<LoginStep>("login");
  
  const generalFlow = useGeneralLoginFlow();
  const snsFlow = useSnsLoginFlow();

  // 에러는 두 플로우 중 하나만 표시
  const error = generalFlow.error || snsFlow.error;
  const isLoading = generalFlow.isLoading || snsFlow.isLoading;

  /**
   * 일반 로그인 처리
   */
  const handleLogin = async (wellnessId: string, password: string) => {
    // 에러 클리어
    generalFlow.clearError();
    snsFlow.clearError();
    
    await generalFlow.handleLogin(wellnessId, password);
  };

  /**
   * 카카오 로그인
   */
  const handleKakaoLogin = () => {
    generalFlow.clearError();
    snsFlow.clearError();
    snsFlow.handleSnsLogin("kakao");
  };

  /**
   * 네이버 로그인
   */
  const handleNaverLogin = () => {
    generalFlow.clearError();
    snsFlow.clearError();
    snsFlow.handleSnsLogin("naver");
  };

  /**
   * 애플 로그인
   */
  const handleAppleLogin = () => {
    generalFlow.clearError();
    snsFlow.clearError();
    snsFlow.handleSnsLogin("apple");
  };

  /**
   * 에러 클리어
   */
  const clearError = () => {
    generalFlow.clearError();
    snsFlow.clearError();
  };

  return {
    currentStep,
    isLoading,
    error,
    handleLogin,
    handleKakaoLogin,
    handleNaverLogin,
    handleAppleLogin,
    setStep: setCurrentStep,
    clearError,
  };
}
