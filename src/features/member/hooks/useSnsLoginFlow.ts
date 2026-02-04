/**
 * Feature: Member - SNS 로그인 플로우
 * 
 * 역할: SNS 로그인 비즈니스 로직
 * 1. SNS 로그인 (카카오/네이버/애플)
 * 2. checkSnsUser API → 상태에 따라 분기
 *    - 기존 회원: 자동 로그인
 *    - 신규 회원: 회원가입 플로우로 전환
 * 
 * 네이티브 앱 통신:
 * - 플러터 앱과 웹뷰 간 브리지 통신 지원
 * - 카카오/네이버 네이티브 SDK 로그인 결과 수신
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCheckSnsUser, useMemberStore } from "@/domains/member/model";

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
  const memberStore = useMemberStore();
  const checkSnsUser = useCheckSnsUser();
  const [isSocialLoading, setIsSocialLoading] = useState(false);

  /**
   * SNS 로그인 성공 공통 핸들러
   */
  const createSocialLoginSuccessHandler = useCallback(
    (provider: "kakao" | "naver") => {
      return async (data: SocialLoginData) => {
        const providerName = PROVIDER_CONFIG[provider].name;

        try {
          setIsSocialLoading(true);

          console.log(`📱 웹에서 ${providerName} 로그인 데이터 수신:`, data);

          // SNS 타입 매핑
          const snsType = provider === "kakao" ? "KAKAO" : provider === "naver" ? "NAVER" : "APPLE";

          // checkSnsUser API 호출
          const result = await checkSnsUser.mutateAsync({
            snsType: snsType as "KAKAO" | "NAVER" | "APPLE",
            accessToken: data.accessToken || data.id,
          });

          if (result.data.status === "duplicate") {
            // 기존 회원 → 로그인 성공
            toast.success("로그인 성공!");
            router.push("/");
          } else if (result.data.status === "new") {
            // 신규 회원 → 회원가입으로 전환
            if (result.data.registerToken) {
              memberStore.setRegisterToken(result.data.registerToken);
              memberStore.setSnsInfo(snsType as "KAKAO" | "NAVER" | "APPLE", data.accessToken || data.id);
              
              toast.info("회원가입이 필요합니다");
              router.push("/member/terms-agreement?type=sns");
            } else {
              toast.error("인증 토큰을 받지 못했습니다");
            }
          } else if (result.data.status === "link_required") {
            toast.info("계정 연동이 필요합니다");
            // TODO: 계정 연동 페이지로 이동
          }
        } catch (error: any) {
          console.error(`❌ ${providerName} 로그인 실패:`, error);
          
          const errorMessage =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            `${providerName} 로그인에 실패했습니다`;
          toast.error(errorMessage);
        } finally {
          setIsSocialLoading(false);
        }
      };
    },
    [checkSnsUser, memberStore, router]
  );

  /**
   * SNS 로그인 실패 공통 핸들러
   */
  const createSocialLoginErrorHandler = useCallback(
    (provider: "kakao" | "naver") => {
      return (error: SocialLoginError) => {
        const providerName = PROVIDER_CONFIG[provider].name;
        setIsSocialLoading(false);
        toast.error(error.message || `${providerName} 로그인에 실패했습니다`);
        console.error(`${providerName} 로그인 실패:`, error);
      };
    },
    []
  );

  // 콜백 함수 생성
  const handleKakaoLoginSuccess = useCallback(
    createSocialLoginSuccessHandler("kakao"),
    [createSocialLoginSuccessHandler]
  );

  const handleKakaoLoginError = useCallback(
    createSocialLoginErrorHandler("kakao"),
    [createSocialLoginErrorHandler]
  );

  const handleNaverLoginSuccess = useCallback(
    createSocialLoginSuccessHandler("naver"),
    [createSocialLoginSuccessHandler]
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
    const stateData = { mode: "login", type: "member" };

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
    console.log(`🔐 SNS 로그인 시작: ${provider}`);
    console.log(`📱 플러터 브리지 확인:`, {
      kakao: typeof window.requestKakaoLogin,
      naver: typeof window.requestNaverLogin,
    });

    if (provider === "apple") {
      console.log("Apple login not implemented yet");
      toast.info("Apple 로그인은 준비 중입니다");
      return;
    }

    // 네이티브 앱 로그인 시도, 실패 시 웹 OAuth로 폴백
    if (!requestNativeLogin(provider)) {
      requestWebOAuthLogin(provider);
    }
  };

  return {
    handleSnsLogin,
    isLoading: isSocialLoading || checkSnsUser.isPending,
  };
}
