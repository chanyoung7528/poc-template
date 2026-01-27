/**
 * SNS 간편가입/로그인 플로우 Hook
 * 
 * 플로우:
 * 1. SNS 로그인 (카카오/네이버/Apple)
 * 2. checkSnsUser
 *    ├─ 기존 회원 → loginSns (자동)
 *    ├─ 신규 회원 → registerToken 발급 → 본인인증 → registerSnsUser
 *    └─ 계정 연동 필요 → linkToken 발급 → linkSnsAccount
 */

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import {
  useCheckSnsUser,
  useLoginSns,
  useRegisterSns,
  useLinkSnsAccount,
} from "@/domains/auth/model/auth.queries";
import { useAuthStore } from "@/domains/auth/model/auth.store";
import type { SnsType } from "@/domains/auth/model/auth.types";

export type SnsAuthStep =
  | "idle" // 대기
  | "sns-login" // SNS 로그인 중
  | "check-user" // 사용자 상태 확인 중
  | "verification" // 본인인증 (신규 회원)
  | "terms" // 약관 동의 (신규 회원)
  | "link-account" // 계정 연동 안내
  | "complete"; // 완료

interface UseSnsAuthFlowReturn {
  currentStep: SnsAuthStep;
  isLoading: boolean;
  error: string | null;

  // SNS 로그인 시작
  handleSnsLogin: (provider: "kakao" | "naver" | "apple") => void;

  // SNS 로그인 성공 후 호출 (네이티브 앱에서)
  handleSnsLoginSuccess: (data: {
    provider: SnsType;
    snsId: string;
    snsEmail?: string;
    nickname?: string;
    profileImage?: string;
  }) => Promise<void>;

  // 본인인증 완료 후 호출 (신규 회원)
  handleVerificationComplete: (transactionId: string) => Promise<void>;

  // 약관 동의 후 회원가입 완료
  handleTermsAgree: (data: {
    termsAgreed: boolean;
    privacyAgreed: boolean;
    marketingAgreed?: boolean;
  }) => Promise<void>;

  // 계정 연동 확인
  handleLinkAccount: () => Promise<void>;

  clearError: () => void;
}

export function useSnsAuthFlow(): UseSnsAuthFlowReturn {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<SnsAuthStep>("idle");
  const [error, setError] = useState<string | null>(null);
  const [pendingSnsData, setPendingSnsData] = useState<{
    provider: SnsType;
    snsId: string;
    snsEmail?: string;
  } | null>(null);
  const [pendingTransactionId, setPendingTransactionId] = useState<string | null>(null);

  const authStore = useAuthStore();
  const checkSnsUserMutation = useCheckSnsUser();
  const loginSnsMutation = useLoginSns();
  const registerSnsMutation = useRegisterSns();
  const linkSnsMutation = useLinkSnsAccount();

  // SNS 로그인 시작
  const handleSnsLogin = useCallback((provider: "kakao" | "naver" | "apple") => {
    setError(null);
    setCurrentStep("sns-login");
    
    // 네이티브 앱 또는 웹 OAuth로 SNS 로그인 시작
    // (useLoginFlow의 handleSocialLogin 로직 재사용)
    console.log(`SNS 로그인 시작: ${provider}`);
    
    // 실제 구현은 기존 useLoginFlow의 로직과 통합
  }, []);

  // SNS 로그인 성공 후 처리
  const handleSnsLoginSuccess = async (data: {
    provider: SnsType;
    snsId: string;
    snsEmail?: string;
    nickname?: string;
    profileImage?: string;
  }) => {
    try {
      setError(null);
      setCurrentStep("check-user");

      // SNS 사용자 상태 확인
      const result = await checkSnsUserMutation.mutateAsync({
        snsType: data.provider,
        snsId: data.snsId,
        snsEmail: data.snsEmail,
      });

      if (result.status === "EXISTING" && result.user) {
        // 기존 회원 → 자동 로그인
        await loginSnsMutation.mutateAsync({
          snsType: data.provider,
          snsId: data.snsId,
        });

        setCurrentStep("complete");
        router.push("/main" as Route);
      } else if (result.status === "NEW_USER" && result.registerToken) {
        // 신규 회원 → registerToken 저장 + 본인인증 필요
        authStore.setRegisterToken({
          token: result.registerToken,
          snsType: data.provider,
          expiresAt: Date.now() + 5 * 60 * 1000, // 5분
        });

        setPendingSnsData({
          provider: data.provider,
          snsId: data.snsId,
          snsEmail: data.snsEmail,
        });

        setCurrentStep("verification");
        router.push("/auth/verification" as Route);
      } else if (result.status === "LINK_REQUIRED" && result.linkToken && result.registerToken) {
        // 계정 연동 필요 → linkToken + registerToken 저장
        authStore.setLinkToken({
          token: result.linkToken,
          userUlid: result.existingUser?.ulid || "",
          expiresAt: Date.now() + 5 * 60 * 1000,
        });

        authStore.setRegisterToken({
          token: result.registerToken,
          snsType: data.provider,
          expiresAt: Date.now() + 5 * 60 * 1000,
        });

        // 안내 화면으로 이동
        const duplicatePath = `/duplicate-account?maskedId=${result.existingUser?.maskedId}&provider=${result.existingUser?.provider}` as Route;
        router.push(duplicatePath);
      }
    } catch (err) {
      console.error("SNS 로그인 처리 실패:", err);
      setError(err instanceof Error ? err.message : "SNS 로그인에 실패했습니다");
      setCurrentStep("idle");
    }
  };

  // 본인인증 완료 (신규 회원)
  const handleVerificationComplete = async (transactionId: string) => {
    try {
      setError(null);
      setPendingTransactionId(transactionId);
      setCurrentStep("terms");
    } catch (err) {
      console.error("본인인증 처리 실패:", err);
      setError(err instanceof Error ? err.message : "본인인증 처리에 실패했습니다");
    }
  };

  // 약관 동의 후 SNS 회원가입
  const handleTermsAgree = async (data: {
    termsAgreed: boolean;
    privacyAgreed: boolean;
    marketingAgreed?: boolean;
  }) => {
    try {
      setError(null);

      // registerToken 유효성 검증
      if (!authStore.isRegisterTokenValid()) {
        throw new Error("인증 시간이 만료되었습니다. 다시 시도해주세요.");
      }

      const registerToken = authStore.registerToken?.token;
      if (!registerToken || !pendingTransactionId) {
        throw new Error("인증 정보를 찾을 수 없습니다.");
      }

      // SNS 회원가입 API 호출
      await registerSnsMutation.mutateAsync({
        registerToken,
        transactionId: pendingTransactionId,
        termsAgreed: data.termsAgreed,
        privacyAgreed: data.privacyAgreed,
        marketingAgreed: data.marketingAgreed,
      });

      // 토큰 정리
      authStore.clearTokens();
      setPendingSnsData(null);
      setPendingTransactionId(null);

      // 완료 화면으로 이동
      setCurrentStep("complete");
      router.push("/signup/complete" as Route);
    } catch (err) {
      console.error("SNS 회원가입 실패:", err);
      setError(err instanceof Error ? err.message : "회원가입에 실패했습니다");
    }
  };

  // 계정 연동 (일반 계정에 SNS 로그인 추가)
  const handleLinkAccount = async () => {
    try {
      setError(null);

      // linkToken, registerToken 유효성 검증
      if (!authStore.isLinkTokenValid() || !authStore.isRegisterTokenValid()) {
        throw new Error("연동 시간이 만료되었습니다. 다시 시도해주세요.");
      }

      const linkToken = authStore.linkToken?.token;
      const registerToken = authStore.registerToken?.token;

      if (!linkToken || !registerToken) {
        throw new Error("연동 정보를 찾을 수 없습니다.");
      }

      // SNS 계정 연동 API 호출
      await linkSnsMutation.mutateAsync({
        linkToken,
        registerToken,
      });

      // 토큰 정리
      authStore.clearTokens();
      setPendingSnsData(null);

      // 메인 화면으로 이동
      setCurrentStep("complete");
      router.push("/main" as Route);
    } catch (err) {
      console.error("계정 연동 실패:", err);
      setError(err instanceof Error ? err.message : "계정 연동에 실패했습니다");
    }
  };

  const isLoading =
    checkSnsUserMutation.isPending ||
    loginSnsMutation.isPending ||
    registerSnsMutation.isPending ||
    linkSnsMutation.isPending;

  return {
    currentStep,
    isLoading,
    error,
    handleSnsLogin,
    handleSnsLoginSuccess,
    handleVerificationComplete,
    handleTermsAgree,
    handleLinkAccount,
    clearError: () => setError(null),
  };
}
