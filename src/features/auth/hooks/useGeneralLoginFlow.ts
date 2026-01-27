/**
 * 일반 로그인 플로우 Hook
 * 
 * 플로우:
 * 1. 아이디/비밀번호 입력
 * 2. loginGeneral API 호출
 * 3. authToken + refreshToken 자동 설정 (쿠키)
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { useLoginGeneral } from "@/domains/auth/model/auth.queries";

interface UseGeneralLoginFlowReturn {
  isLoading: boolean;
  error: string | null;
  
  handleLogin: (wellnessId: string, password: string) => Promise<void>;
  clearError: () => void;
}

export function useGeneralLoginFlow(): UseGeneralLoginFlowReturn {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useLoginGeneral();

  const handleLogin = async (wellnessId: string, password: string) => {
    try {
      setError(null);

      // 입력 검증
      if (!wellnessId.trim()) {
        throw new Error("아이디를 입력해주세요");
      }
      if (!password.trim()) {
        throw new Error("비밀번호를 입력해주세요");
      }

      // 로그인 API 호출
      const result = await loginMutation.mutateAsync({
        wellnessId,
        password,
      });

      // 리다이렉트
      const redirectPath = (result.redirectUrl || "/main") as Route;
      router.push(redirectPath);
    } catch (err) {
      console.error("로그인 실패:", err);
      setError(
        err instanceof Error
          ? err.message
          : "로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요."
      );
    }
  };

  return {
    isLoading: loginMutation.isPending,
    error,
    handleLogin,
    clearError: () => setError(null),
  };
}
