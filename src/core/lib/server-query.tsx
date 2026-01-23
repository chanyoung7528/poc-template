import { CACHE_CONFIG } from "@/core/config/constants";
import {
  dehydrate,
  type FetchQueryOptions,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import type { ReactNode } from "react";
import { cache } from "react";

/**
 * Server Component QueryClient (요청당 캐시)
 */
export const getQueryClient = cache(() => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: CACHE_CONFIG.QUERY_STALE_TIME,
        gcTime: CACHE_CONFIG.QUERY_GC_TIME,
      },
    },
  });
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyQueryOptions = FetchQueryOptions<any, any, any, any>;

interface PrefetchBoundaryProps {
  children: ReactNode;
  queryOptions?: AnyQueryOptions | AnyQueryOptions[];
}

/**
 * Server Prefetch Boundary
 * 서버에서 데이터를 prefetch하고 클라이언트로 hydrate
 */
export async function PrefetchBoundary({
  children,
  queryOptions,
}: PrefetchBoundaryProps) {
  const queryClient = getQueryClient();

  if (queryOptions) {
    const options = Array.isArray(queryOptions) ? queryOptions : [queryOptions];
    await Promise.all(
      options.map((option) => queryClient.prefetchQuery(option))
    );
  }

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {children}
    </HydrationBoundary>
  );
}

/**
 * Server Query Fetcher
 */
export async function serverQuery<TData>(
  queryOptions: AnyQueryOptions
): Promise<TData> {
  const queryClient = getQueryClient();
  return queryClient.fetchQuery(queryOptions);
}
