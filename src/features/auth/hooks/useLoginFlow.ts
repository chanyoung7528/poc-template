"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  useLogin,
  useKakaoNativeLogin,
  useNaverNativeLogin,
} from "@/domains/auth/model/auth.queries";

export type LoginStep = "login" | "find-id" | "reset-password";

interface UseLoginFlowReturn {
  currentStep: LoginStep;
  isLoading: boolean;
  error: string | null;
  setStep: (step: LoginStep) => void;
  handleLogin: (email: string, password: string) => Promise<void>;
  handleSocialLogin: (provider: "kakao" | "naver" | "apple") => void;
}

// 앱에서 주입하는 함수 타입 정의
declare global {
  interface Window {
    requestKakaoLogin?: () => void;
    requestNaverLogin?: () => void;
    onKakaoLoginSuccess?: (data: {
      id: string;
      nickname?: string;
      email?: string;
      profileImage?: string;
      cid?: string;
    }) => void;
    onKakaoLoginError?: (error: { error: string; message?: string }) => void;
    onNaverLoginSuccess?: (data: {
      id: string;
      nickname?: string;
      email?: string;
      profileImage?: string;
      cid?: string;
    }) => void;
    onNaverLoginError?: (error: { error: string; message?: string }) => void;
  }
}

export function useLoginFlow(): UseLoginFlowReturn {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<LoginStep>("login");
  const [error, setError] = useState<string | null>(null);
  const [isSocialLoading, setIsSocialLoading] = useState(false);

  const loginMutation = useLogin();
  const kakaoNativeLoginMutation = useKakaoNativeLogin();
  const naverNativeLoginMutation = useNaverNativeLogin();

  const handleLogin = async (email: string, password: string) => {
    try {
      setError(null);
      await loginMutation.mutateAsync({ email, password });
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다");
    }
  };

  // 카카오 로그인 성공 콜백
  const handleKakaoLoginSuccess = useCallback(
    async (data: {
      id: string;
      nickname?: string;
      email?: string;
      profileImage?: string;
      cid?: string;
    }) => {
      try {
        setIsSocialLoading(true);
        setError(null);

        const result = await kakaoNativeLoginMutation.mutateAsync({
          id: data.id,
          nickname: data.nickname,
          email: data.email,
          profileImage: data.profileImage,
          cid: data.cid || data.id,
        });

        // 서버에서 반환한 redirectUrl로 이동
        if (result.redirectUrl) {
          router.push(result.redirectUrl);
        } else {
          router.push("/");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "카카오 로그인에 실패했습니다";
        setError(errorMessage);
        console.error("카카오 로그인 처리 실패:", err);
      } finally {
        setIsSocialLoading(false);
      }
    },
    [kakaoNativeLoginMutation, router]
  );

  // 카카오 로그인 실패 콜백
  const handleKakaoLoginError = useCallback(
    (error: { error: string; message?: string }) => {
      setIsSocialLoading(false);
      setError(error.message || "카카오 로그인에 실패했습니다");
      console.error("카카오 로그인 실패:", error);
    },
    []
  );

  // 네이버 로그인 성공 콜백
  const handleNaverLoginSuccess = useCallback(
    async (data: {
      id: string;
      nickname?: string;
      email?: string;
      profileImage?: string;
      cid?: string;
    }) => {
      try {
        setIsSocialLoading(true);
        setError(null);

        const result = await naverNativeLoginMutation.mutateAsync({
          id: data.id,
          nickname: data.nickname,
          email: data.email,
          profileImage: data.profileImage,
          cid: data.cid || data.id,
        });

        // 서버에서 반환한 redirectUrl로 이동
        if (result.redirectUrl) {
          router.push(result.redirectUrl);
        } else {
          router.push("/");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "네이버 로그인에 실패했습니다";
        setError(errorMessage);
        console.error("네이버 로그인 처리 실패:", err);
      } finally {
        setIsSocialLoading(false);
      }
    },
    [naverNativeLoginMutation, router]
  );

  // 네이버 로그인 실패 콜백
  const handleNaverLoginError = useCallback(
    (error: { error: string; message?: string }) => {
      setIsSocialLoading(false);
      setError(error.message || "네이버 로그인에 실패했습니다");
      console.error("네이버 로그인 실패:", error);
    },
    []
  );

  // 앱에서 주입하는 콜백 함수 등록
  useEffect(() => {
    window.onKakaoLoginSuccess = handleKakaoLoginSuccess;
    window.onKakaoLoginError = handleKakaoLoginError;
    window.onNaverLoginSuccess = handleNaverLoginSuccess;
    window.onNaverLoginError = handleNaverLoginError;

    return () => {
      // cleanup
      delete window.onKakaoLoginSuccess;
      delete window.onKakaoLoginError;
      delete window.onNaverLoginSuccess;
      delete window.onNaverLoginError;
    };
  }, [
    handleKakaoLoginSuccess,
    handleKakaoLoginError,
    handleNaverLoginSuccess,
    handleNaverLoginError,
  ]);

  const handleSocialLogin = (provider: "kakao" | "naver" | "apple") => {
    setError(null);

    if (provider === "kakao") {
      // 앱에 주입된 함수가 있으면 사용, 없으면 웹뷰 방식으로 폴백
      if (typeof window.requestKakaoLogin === "function") {
        setIsSocialLoading(true);
        window.requestKakaoLogin();
      } else {
        // 웹뷰 환경이 아닌 경우 기존 방식으로 폴백
        const kakaoAuthUrl = new URL("https://kauth.kakao.com/oauth/authorize");
        kakaoAuthUrl.searchParams.set(
          "client_id",
          process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || ""
        );
        kakaoAuthUrl.searchParams.set(
          "redirect_uri",
          process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI || ""
        );
        kakaoAuthUrl.searchParams.set("response_type", "code");
        window.location.href = kakaoAuthUrl.toString();
      }
    } else if (provider === "naver") {
      // 앱에 주입된 함수가 있으면 사용, 없으면 웹뷰 방식으로 폴백
      if (typeof window.requestNaverLogin === "function") {
        setIsSocialLoading(true);
        window.requestNaverLogin();
      } else {
        // 웹뷰 환경이 아닌 경우 기존 방식으로 폴백
        const state = Math.random().toString(36).substring(2, 15);
        sessionStorage.setItem("naver_state", state);

        const naverAuthUrl = new URL(
          "https://nid.naver.com/oauth2.0/authorize"
        );
        naverAuthUrl.searchParams.set("response_type", "code");
        naverAuthUrl.searchParams.set(
          "client_id",
          process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || ""
        );
        naverAuthUrl.searchParams.set(
          "redirect_uri",
          process.env.NEXT_PUBLIC_NAVER_REDIRECT_URI || ""
        );
        naverAuthUrl.searchParams.set("state", state);
        window.location.href = naverAuthUrl.toString();
      }
    } else if (provider === "apple") {
      // Apple 로그인 구현 예정
      console.log("Apple login not implemented yet");
    }
  };

  return {
    currentStep,
    isLoading: loginMutation.isPending || isSocialLoading,
    error,
    setStep: setCurrentStep,
    handleLogin,
    handleSocialLogin,
  };
}
