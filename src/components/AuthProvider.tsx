"use client";

import { useAuthSync } from "@/hooks/useAuthSync";

/**
 * Auth Provider Component
 *
 * 앱 전체에서 세션과 Store를 동기화
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  useAuthSync();

  return <>{children}</>;
}
