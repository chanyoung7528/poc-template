/**
 * Feature: Auth - SNS 로그인 플로우
 * 
 * 역할: SNS 로그인 비즈니스 로직
 * 1. SNS 로그인 (카카오/네이버/애플)
 * 2. checkSnsUser API → 상태에 따라 분기
 *    - 기존 회원: 자동 로그인
 *    - 신규 회원: 회원가입 플로우로 전환
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import {
  useKakaoNativeLogin,
  useNaverNativeLogin,
} from "@/domains/auth/model/auth.queries";

export type SnsProvider = "kakao" | "naver" | "apple";

interface SocialLoginData {
  id: string;
  nickname?: string;
  email?: string;
  profileImage?: string;
  cid?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
}

interface SocialLoginError {
  error: string;
  message?: string;
}

// Provider별 설정
const PROVIDER_CONFIG = {
  kakao: {
    name: "카카오",
    authUrl: "https://kauth.kakao.com/oauth/authorize",
    clientIdKey: process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || "",
    redirectUri: process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI || "",
    requestFunction: "requestKakaoLogin" as const,
    additionalParams: { prompt: "login" },
  },
  naver: {
    name: "네이버",
    authUrl: "https://nid.naver.com/oauth2.0/authorize",
    clientIdKey: process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || "",
    redirectUri: process.env.NEXT_PUBLIC_NAVER_REDIRECT_URI || "",
    requestFunction: "requestNaverLogin" as const,
  },
} as const;

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

export function useSnsLoginFlow() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSocialLoading, setIsSocialLoading] = useState(false);

  const kakaoNativeLoginMutation = useKakaoNativeLogin();
  const naverNativeLoginMutation = useNaverNativeLogin();

  /**
   * SNS 로그인 성공 공통 핸들러
   */
  const createSocialLoginSuccessHandler = useCallback(
    (
      provider: "kakao" | "naver",
      mutation: typeof kakaoNativeLoginMutation | typeof naverNativeLoginMutation
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
            mode: "login", // ✅ 로그인 모드
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            tokenType: data.tokenType,
            expiresIn: data.expiresIn,
          });

          console.log(`✅ ${providerName} 로그인 API 응답:`, result);
          console.log("🍪 현재 브라우저 쿠키:", document.cookie);

          // 서버에서 redirectUrl을 반환한 경우
          if (result.redirectUrl) {
            const redirectPath = result.redirectUrl as Route;
            console.log(`🔄 리다이렉트: ${redirectPath}`);
            
            if (redirectPath.startsWith('http')) {
              window.location.href = redirectPath;
            } else {
              router.push(redirectPath);
            }
          } else if (result.success) {
            // 성공했지만 redirectUrl이 없는 경우 기본 경로로 이동
            router.push("/");
          }
        } catch (err: any) {
          // 에러 응답에 redirectUrl이 있는 경우
          if (err?.response?.data?.redirectUrl) {
            const redirectUrl = err.response.data.redirectUrl;
            console.log(`🔄 에러 응답 리다이렉트: ${redirectUrl}`);
            
            if (redirectUrl.startsWith('http')) {
              window.location.href = redirectUrl;
            } else {
              router.push(redirectUrl as Route);
            }
            return;
          }

          const errorDetails = {
            message: err?.message,
            response: err?.response ? {
              status: err.response.status,
              statusText: err.response.statusText,
              data: err.response.data,
            } : null,
            stack: err?.stack,
          };

          console.error(`❌ ${providerName} 로그인 실패:`, JSON.stringify(errorDetails, null, 2));

          const errorMessage =
            err?.response?.data?.message ||
            err?.response?.data?.error ||
            err?.message ||
            `${providerName} 로그인에 실패했습니다`;
          setError(errorMessage);
        } finally {
          setIsSocialLoading(false);
        }
      };
    },
    [router]
  );

  /**
   * SNS 로그인 실패 공통 핸들러
   */
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

  /**
   * 네이티브 앱 로그인 요청
   */
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

  /**
   * 웹 OAuth 로그인
   */
  const requestWebOAuthLogin = (provider: "kakao" | "naver") => {
    const config = PROVIDER_CONFIG[provider];
    console.log(`🌐 ${config.name} 웹 OAuth 로그인 (웹 환경), mode: login`);

    const authUrl = new URL(config.authUrl);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", config.clientIdKey);
    authUrl.searchParams.set("redirect_uri", config.redirectUri);

    // state에 mode 정보 포함
    const stateData = { mode: "login" };

    // Provider별 추가 파라미터
    if (provider === "kakao") {
      authUrl.searchParams.set("prompt", "login");
      authUrl.searchParams.set(
        "state",
        encodeURIComponent(JSON.stringify(stateData))
      );
    } else if (provider === "naver") {
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

  /**
   * SNS 로그인 시작
   */
  const handleSnsLogin = (provider: SnsProvider) => {
    setError(null);

    console.log(`🔐 SNS 로그인 시작: ${provider}`);
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
    handleSnsLogin,
    isLoading: isSocialLoading,
    error,
    clearError: () => setError(null),
  };
}
