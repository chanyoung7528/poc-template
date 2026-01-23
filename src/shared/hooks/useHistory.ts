"use client";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
/**
 * 뒤로가기 훅
 * - 히스토리가 있으면 뒤로가기
 * - 없으면 홈으로 이동 (fallback)
 * - TODO: 네이티브 적용 후 개선 필요
 */
export function useHistory(fallbackUrl = "/") {
  const router = useRouter();
  const goBack = useCallback(() => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.replace(fallbackUrl);
    }
  }, [router, fallbackUrl]);
  return goBack;
}
