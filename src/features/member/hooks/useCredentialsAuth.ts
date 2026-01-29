/**
 * Feature: Member - 본인인증 플로우
 *
 * 역할: PortOne 본인인증 처리 (POC)
 * - PortOne SDK를 사용하여 본인인증 시작
 * - 웹뷰/일반 브라우저 모두 지원
 * - 본인인증 완료 후 imp_uid만 전달 (기존 member 로직 사용)
 */

import { useState, useCallback } from "react";
import { toast } from "sonner";

// 아임포트 V1 설정 (KG이니시스) - 환경변수 필수
const IMP_CODE = process.env.NEXT_PUBLIC_IMP_CODE;
const CHANNEL_KEY = process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY;

// 웹뷰 환경 감지
const isWebView = () => {
  const userAgent = navigator.userAgent.toLowerCase();
  return (
    userAgent.includes("wv") || // Android WebView
    userAgent.includes("flutter") || // Flutter
    ((userAgent.includes("iphone") || userAgent.includes("ipad")) &&
      !userAgent.includes("safari")) // iOS WebView (Safari 아님)
  );
};

export function useCredentialsAuth() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  /**
   * PortOne PASS 본인인증 시작
   * - 웹뷰: 리다이렉트 방식
   * - 일반 브라우저: 콜백 방식
   */
  const startPassAuth = useCallback(
    async (onSuccess: (transactionId: string) => void) => {
      // 환경변수 체크
      if (!IMP_CODE) {
        toast.error(
          "본인인증 설정 오류: NEXT_PUBLIC_IMP_CODE가 설정되지 않았습니다"
        );
        console.error("환경변수 누락: NEXT_PUBLIC_IMP_CODE");
        return;
      }

      if (!CHANNEL_KEY) {
        toast.error(
          "본인인증 설정 오류: NEXT_PUBLIC_PORTONE_CHANNEL_KEY가 설정되지 않았습니다"
        );
        console.error("환경변수 누락: NEXT_PUBLIC_PORTONE_CHANNEL_KEY");
        return;
      }

      const { IMP } = window;
      if (!IMP) {
        toast.error(
          "아임포트 모듈이 로드되지 않았습니다. 페이지를 새로고침해주세요."
        );
        return;
      }

      setIsAuthenticating(true);

      try {
        // 아임포트 초기화
        IMP.init(IMP_CODE);
        console.log("🔧 아임포트 V1 초기화:", IMP_CODE);

        // 웹뷰 환경 확인
        const isInWebView = isWebView();
        console.log("🔍 환경 감지:", {
          isWebView: isInWebView,
          userAgent: navigator.userAgent,
        });

        // 리다이렉트 URL 설정 (본인인증 완료 후 돌아올 URL)
        const redirectUrl = `${window.location.origin}/member/signup/credentials`;

        // 본인인증 요청 데이터
        const data = {
          channelKey: CHANNEL_KEY,
          merchant_uid: `mid_${Date.now()}`,
          popup: false, // 리다이렉트 방식 사용
          m_redirect_url: redirectUrl, // 리다이렉트 URL
        };

        console.log("📤 아임포트 V1 본인인증 요청:", {
          ...data,
          channelKey: CHANNEL_KEY.substring(0, 20) + "...",
          isWebView: isInWebView,
        });

        // 웹뷰 환경: 리다이렉트 방식
        if (isInWebView) {
          console.log("📱 웹뷰 환경: 리다이렉트 방식으로 본인인증 시작");
          IMP.certification(data, (rsp: any) => {
            // 웹뷰에서는 이 콜백이 실행되지 않아야 함
            console.log("⚠️ 웹뷰 환경에서 콜백 실행됨 (무시):", rsp);
          });
          // 리다이렉트되므로 여기서는 아무것도 하지 않음
          return;
        }

        // 일반 브라우저 환경: 콜백 방식
        console.log("🌐 일반 브라우저 환경: 콜백 방식으로 본인인증 시작");
        IMP.certification(
          data,
          (rsp: {
            success: boolean;
            imp_uid?: string;
            merchant_uid?: string;
            error_msg?: string;
          }) => {
            console.log("아임포트 응답:", rsp);

            if (rsp.success && rsp.imp_uid) {
              // ✅ 본인인증 성공 → transactionId (imp_uid) 전달
              console.log("✅ 본인인증 성공, imp_uid:", rsp.imp_uid);
              onSuccess(rsp.imp_uid);
            } else {
              // 인증 실패
              const errorMsg = rsp.error_msg || "본인인증에 실패하였습니다.";
              console.error("인증 실패:", rsp);
              toast.error(errorMsg);
            }
            setIsAuthenticating(false);
          }
        );
      } catch (error) {
        console.error("본인인증 시작 중 오류:", error);
        toast.error("본인인증 시작에 실패했습니다");
        setIsAuthenticating(false);
      }
    },
    []
  );

  /**
   * 리다이렉트 결과 처리 (웹뷰 환경)
   */
  const handleRedirectResult = useCallback(
    (result: { success: boolean; imp_uid?: string; error_msg?: string }) => {
      console.log("📱 리다이렉트 결과 처리:", result);

      if (result.success && result.imp_uid) {
        // ✅ 본인인증 성공 → transactionId (imp_uid) 전달
        console.log("✅ 본인인증 성공 (리다이렉트), imp_uid:", result.imp_uid);
        // onSuccess는 페이지에서 직접 처리
        return result.imp_uid;
      } else {
        // 인증 실패
        const errorMsg = result.error_msg || "본인인증에 실패하였습니다.";
        console.error("인증 실패:", result);
        toast.error(errorMsg);
        return null;
      }
    },
    []
  );

  return {
    startPassAuth,
    handleRedirectResult,
    isAuthenticating,
  };
}
