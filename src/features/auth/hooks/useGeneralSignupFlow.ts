/**
 * 일반 회원가입 플로우 Hook
 * 
 * 플로우:
 * 1. 본인인증 (PASS)
 * 2. checkUserStatus → verificationToken 또는 linkToken
 * 3-A. 신규 회원: 아이디/비밀번호 → registerGeneral
 * 3-B. 기존 회원: 계정 연동 → linkGeneralAccount
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { useCheckUserStatus, useRegisterGeneral, useLinkGeneralAccount } from "@/domains/auth/model/auth.queries";
import { useAuthStore } from "@/domains/auth/model/auth.store";

export type GeneralSignupStep = 
  | "verification" // 본인인증
  | "check-status" // 사용자 상태 확인
  | "form" // 아이디/비밀번호 입력
  | "terms" // 약관 동의
  | "link-account" // 계정 연동 안내
  | "complete"; // 완료

interface UseGeneralSignupFlowReturn {
  currentStep: GeneralSignupStep;
  isLoading: boolean;
  error: string | null;
  
  // 본인인증 완료 후 호출
  handleVerificationComplete: (transactionId: string) => Promise<void>;
  
  // 아이디/비밀번호 입력 완료 후 호출
  handleFormSubmit: (data: {
    wellnessId: string;
    password: string;
    termsAgreed: boolean;
    privacyAgreed: boolean;
    marketingAgreed?: boolean;
  }) => Promise<void>;
  
  // 계정 연동 확인 후 호출
  handleLinkAccount: (data: {
    wellnessId: string;
    password: string;
  }) => Promise<void>;
  
  setStep: (step: GeneralSignupStep) => void;
  clearError: () => void;
}

export function useGeneralSignupFlow(): UseGeneralSignupFlowReturn {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<GeneralSignupStep>("verification");
  const [error, setError] = useState<string | null>(null);

  const authStore = useAuthStore();
  const checkStatusMutation = useCheckUserStatus();
  const registerMutation = useRegisterGeneral();
  const linkMutation = useLinkGeneralAccount();

  // 본인인증 완료 후 처리
  const handleVerificationComplete = async (transactionId: string) => {
    try {
      setError(null);
      setCurrentStep("check-status");

      const result = await checkStatusMutation.mutateAsync(transactionId);

      if (result.status === "NEW_USER" && result.verificationToken) {
        // 신규 회원 → verificationToken 저장
        authStore.setVerificationToken({
          token: result.verificationToken,
          expiresAt: Date.now() + 15 * 60 * 1000, // 15분
        });
        setCurrentStep("form");
      } else if (result.status === "LINK_REQUIRED" && result.linkToken) {
        // 기존 회원 (SNS 가입) → linkToken 저장
        authStore.setLinkToken({
          token: result.linkToken,
          userUlid: result.existingUser?.ulid || "",
          expiresAt: Date.now() + 5 * 60 * 1000, // 5분
        });
        
        // 계정 연동 안내 화면으로 이동
        const duplicatePath = `/duplicate-account?maskedId=${result.existingUser?.maskedId}&provider=${result.existingUser?.provider}` as Route;
        router.push(duplicatePath);
      }
    } catch (err) {
      console.error("본인인증 처리 실패:", err);
      setError(err instanceof Error ? err.message : "본인인증 처리에 실패했습니다");
      setCurrentStep("verification");
    }
  };

  // 일반 회원가입 폼 제출
  const handleFormSubmit = async (data: {
    wellnessId: string;
    password: string;
    termsAgreed: boolean;
    privacyAgreed: boolean;
    marketingAgreed?: boolean;
  }) => {
    try {
      setError(null);

      // verificationToken 유효성 검증
      if (!authStore.isVerificationTokenValid()) {
        throw new Error("인증 시간이 만료되었습니다. 다시 시도해주세요.");
      }

      const verificationToken = authStore.verificationToken?.token;
      if (!verificationToken) {
        throw new Error("인증 정보를 찾을 수 없습니다.");
      }

      // 회원가입 API 호출
      await registerMutation.mutateAsync({
        verificationToken,
        wellnessId: data.wellnessId,
        password: data.password,
        termsAgreed: data.termsAgreed,
        privacyAgreed: data.privacyAgreed,
        marketingAgreed: data.marketingAgreed,
      });

      // 토큰 정리
      authStore.clearTokens();

      // 완료 화면으로 이동
      setCurrentStep("complete");
      const completePath = `/signup/complete?wellnessId=${data.wellnessId}` as Route;
      router.push(completePath);
    } catch (err) {
      console.error("회원가입 실패:", err);
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다");
    }
  };

  // 계정 연동 (SNS 계정에 일반 로그인 추가)
  const handleLinkAccount = async (data: {
    wellnessId: string;
    password: string;
  }) => {
    try {
      setError(null);

      // linkToken 유효성 검증
      if (!authStore.isLinkTokenValid()) {
        throw new Error("연동 시간이 만료되었습니다. 다시 시도해주세요.");
      }

      const linkToken = authStore.linkToken?.token;
      if (!linkToken) {
        throw new Error("연동 정보를 찾을 수 없습니다.");
      }

      // 계정 연동 API 호출
      await linkMutation.mutateAsync({
        linkToken,
        wellnessId: data.wellnessId,
        password: data.password,
      });

      // 토큰 정리
      authStore.clearTokens();

      // 메인 화면으로 이동
      router.push("/main" as Route);
    } catch (err) {
      console.error("계정 연동 실패:", err);
      setError(err instanceof Error ? err.message : "계정 연동에 실패했습니다");
    }
  };

  const isLoading = 
    checkStatusMutation.isPending || 
    registerMutation.isPending || 
    linkMutation.isPending;

  return {
    currentStep,
    isLoading,
    error,
    handleVerificationComplete,
    handleFormSubmit,
    handleLinkAccount,
    setStep: setCurrentStep,
    clearError: () => setError(null),
  };
}
