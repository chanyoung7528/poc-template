'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

/**
 * React Query 전역 설정
 * 
 * - 캐시 전략 설정
 * - 재시도 정책
 * - 에러 처리 (컴포넌트 레벨에서 처리)
 */

function extractErrorCode(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null;
  if ('code' in error && typeof error.code === 'string') return error.code;
  return null;
}

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1분
            gcTime: 5 * 60 * 1000, // 5분
            refetchOnWindowFocus: false,
            retry: (failureCount, error) => {
              // 인증 에러는 재시도하지 않음
              const errorCode = extractErrorCode(error);
              if (errorCode && errorCode.startsWith('AUTH_')) {
                return false;
              }
              return failureCount < 1;
            },
          },
          mutations: {
            // mutation 에러는 컴포넌트에서 직접 처리
            retry: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
