"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import {
  useKakaoNativeLogin,
  useNaverNativeLogin,
} from "@/domains/auth/model/auth.queries";

export type LoginStep = "login" | "find-id" | "reset-password";
export type SocialProvider = "kakao" | "naver" | "apple";
export type AuthMode = "login" | "signup";

interface UseLoginFlowProps {
  mode?: AuthMode; // 'login' 또는 'signup'
}

interface UseLoginFlowReturn {
  currentStep: LoginStep;
  isLoading: boolean;
  error: string | null;
  setStep: (step: LoginStep) => void;
  handleLogin: (email: string, password: string) => Promise<void>;
  handleSocialLogin: (provider: SocialProvider) => void;
}

interface SocialLoginData {
  id: string;
  nickname?: string;
  email?: string;
  profileImage?: string;
  cid?: string;
  // 소셜 로그인 토큰 정보
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number; // 초 단위
}

interface SocialLoginError {
  error: string;
  message?: string;
}

// 앱에서 주입하는 함수 타입 정의
declare global {
  interface Window {
    requestKakaoLogin?: () => void;
    requestNaverLogin?: () => void;
    onKakaoLoginSuccess?: (data: SocialLoginData) => void;
    onKakaoLoginError?: (error: SocialLoginError) => void;
    onNaverLoginSuccess?: (data: SocialLoginData) => void;
    onNaverLoginError?: (error: SocialLoginError) => void;
  }
}

// Provider별 설정
const PROVIDER_CONFIG = {
  kakao: {
    name: "카카오",
    authUrl: "https://kauth.kakao.com/oauth/authorize",
    clientIdKey: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || "",
    redirectUri: process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI || "",
    requestFunction: "requestKakaoLogin" as const,
    additionalParams: { prompt: "login" }, // 자동 로그인 방지
  },
  naver: {
    name: "네이버",
    authUrl: "https://nid.naver.com/oauth2.0/authorize",
    clientIdKey: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || "",
    redirectUri: process.env.NEXT_PUBLIC_NAVER_REDIRECT_URI || "",
    requestFunction: "requestNaverLogin" as const,
  },
} as const;

export function useLoginFlow(props?: UseLoginFlowProps): UseLoginFlowReturn {
  const mode = props?.mode || "login"; // 기본값은 'login'
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<LoginStep>("login");
  const [error, setError] = useState<string | null>(null);
  const [isSocialLoading, setIsSocialLoading] = useState(false);

  const loginMutation = { isPending: false }; // @deprecated
  const kakaoNativeLoginMutation = useKakaoNativeLogin();
  const naverNativeLoginMutation = useNaverNativeLogin();

  // 일반 로그인 처리 (@deprecated - useGeneralLoginFlow 사용 권장)
  const handleLogin = async (email: string, password: string) => {
    try {
      setError(null);
      console.warn('useLoginFlow.handleLogin is deprecated. Use useGeneralLoginFlow instead.');
      // 기존 로그인 로직은 useGeneralLoginFlow로 이동
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다");
    }
  };

  // 소셜 로그인 성공 공통 핸들러
  const createSocialLoginSuccessHandler = useCallback(
    (
      provider: "kakao" | "naver",
      mutation:
        | typeof kakaoNativeLoginMutation
        | typeof naverNativeLoginMutation
    ) => {
      return async (data: SocialLoginData) => {
        const providerName = PROVIDER_CONFIG[provider].name;

        try {
          setIsSocialLoading(true);
          setError(null);

          console.log(`📱 웹에서 ${providerName} 로그인 데이터 수신:`, data);

          const result = await mutation.mutateAsync({
            id: data.id,
            nickname: data.nickname,
            email: data.email,
            profileImage: data.profileImage,
            cid: data.cid || data.id,
            mode, // ✅ mode 전달
            // ✅ 토큰 정보 전달
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            tokenType: data.tokenType,
            expiresIn: data.expiresIn,
          });

          console.log(`✅ ${providerName} 로그인 API 응답:`, result);

          // 쿠키 확인
          console.log("🍪 현재 브라우저 쿠키:", document.cookie);

          // 서버에서 반환한 redirectUrl로 이동
          const redirectPath = (result.redirectUrl || "/") as Route;
          router.push(redirectPath);
        } catch (err: any) {
          console.error(`❌ ${providerName} 로그인 처리 실패:`, {
            error: err,
            response: err?.response?.data,
            status: err?.response?.status,
            message: err?.message,
          });

          const errorMessage =
            err?.response?.data?.message ||
            err?.message ||
            `${providerName} 로그인에 실패했습니다`;
          setError(errorMessage);
        } finally {
          setIsSocialLoading(false);
        }
      };
    },
    [router, mode] // ✅ mode를 의존성 배열에 추가
  );

  // 소셜 로그인 실패 공통 핸들러
  const createSocialLoginErrorHandler = useCallback(
    (provider: "kakao" | "naver") => {
      return (error: SocialLoginError) => {
        const providerName = PROVIDER_CONFIG[provider].name;
        setIsSocialLoading(false);
        setError(error.message || `${providerName} 로그인에 실패했습니다`);
        console.error(`${providerName} 로그인 실패:`, error);
      };
    },
    []
  );

  // 콜백 함수 생성
  const handleKakaoLoginSuccess = useCallback(
    createSocialLoginSuccessHandler("kakao", kakaoNativeLoginMutation),
    [createSocialLoginSuccessHandler, kakaoNativeLoginMutation]
  );

  const handleKakaoLoginError = useCallback(
    createSocialLoginErrorHandler("kakao"),
    [createSocialLoginErrorHandler]
  );

  const handleNaverLoginSuccess = useCallback(
    createSocialLoginSuccessHandler("naver", naverNativeLoginMutation),
    [createSocialLoginSuccessHandler, naverNativeLoginMutation]
  );

  const handleNaverLoginError = useCallback(
    createSocialLoginErrorHandler("naver"),
    [createSocialLoginErrorHandler]
  );

  // 앱에서 주입하는 콜백 함수 등록
  useEffect(() => {
    window.onKakaoLoginSuccess = handleKakaoLoginSuccess;
    window.onKakaoLoginError = handleKakaoLoginError;
    window.onNaverLoginSuccess = handleNaverLoginSuccess;
    window.onNaverLoginError = handleNaverLoginError;

    return () => {
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

  // 네이티브 앱 로그인 요청
  const requestNativeLogin = (provider: "kakao" | "naver"): boolean => {
    const config = PROVIDER_CONFIG[provider];
    const requestFn = window[config.requestFunction];

    if (typeof requestFn === "function") {
      console.log(`📱 ${config.name} 네이티브 로그인 요청 (플러터 앱)`);
      setIsSocialLoading(true);
      requestFn();
      return true;
    }

    return false;
  };

  // 웹 OAuth 로그인
  const requestWebOAuthLogin = (provider: "kakao" | "naver") => {
    const config = PROVIDER_CONFIG[provider];
    console.log(`🌐 ${config.name} 웹 OAuth 로그인 (웹 환경), mode: ${mode}`);

    const authUrl = new URL(config.authUrl);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", config.clientIdKey);
    authUrl.searchParams.set("redirect_uri", config.redirectUri);

    // state에 mode 정보 포함
    const stateData = { mode };

    // Provider별 추가 파라미터
    if (provider === "kakao") {
      // 카카오: 자동 로그인 방지 + state 추가
      authUrl.searchParams.set("prompt", "login");
      authUrl.searchParams.set(
        "state",
        encodeURIComponent(JSON.stringify(stateData))
      );
    } else if (provider === "naver") {
      // 네이버: state에 mode 정보 포함
      const randomState = Math.random().toString(36).substring(2, 15);
      const stateWithMode = { ...stateData, naver_state: randomState };
      sessionStorage.setItem("naver_state", randomState);
      authUrl.searchParams.set(
        "state",
        encodeURIComponent(JSON.stringify(stateWithMode))
      );
    }

    window.location.href = authUrl.toString();
  };

  // 소셜 로그인 처리
  const handleSocialLogin = (provider: SocialProvider) => {
    setError(null);

    console.log(`🔐 소셜 로그인 시작: ${provider}`);
    console.log(`📱 플러터 브리지 확인:`, {
      kakao: typeof window.requestKakaoLogin,
      naver: typeof window.requestNaverLogin,
    });

    if (provider === "apple") {
      console.log("Apple login not implemented yet");
      return;
    }

    // 네이티브 앱 로그인 시도, 실패 시 웹 OAuth로 폴백
    if (!requestNativeLogin(provider)) {
      requestWebOAuthLogin(provider);
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
