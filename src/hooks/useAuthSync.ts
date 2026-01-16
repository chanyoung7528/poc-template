"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

/**
 * 세션 동기화 Hook
 *
 * 서버 세션과 Zustand Store를 동기화
 */
export function useAuthSync() {
  const initSession = useAuthStore((state) => state.initSession);
  const logout = useAuthStore((state) => state.logout);

  useEffect(() => {
    // 서버 세션 확인
    const syncSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();

        if (response.ok && data.user) {
          // 세션이 있으면 Store 업데이트
          initSession({
            userId: data.user.id,
            provider: data.user.provider,
            isAuthenticated: !data.user.isTemp,
            isTemp: data.user.isTemp || false,
            termsAgreed: data.user.termsAgreed || false,
            verified: data.user.verified || false,
            email: data.user.email,
            nickname: data.user.nickname,
            profileImage: data.user.profileImage,
            signupStep: getSignupStep(data.user),
          });
        } else {
          // 세션이 없으면 Store 초기화
          logout();
        }
      } catch (error) {
        console.error("세션 동기화 실패:", error);
      }
    };

    syncSession();
  }, [initSession, logout]);
}

/**
 * 세션 데이터로부터 회원가입 단계 추론
 */
function getSignupStep(user: any): "idle" | "terms" | "verification" | "credentials" | "completed" {
  if (!user.isTemp) return "completed";
  if (!user.termsAgreed) return "terms";
  if (!user.verified) return "verification";
  if (user.provider === "wellness") return "credentials";
  return "completed";
}
