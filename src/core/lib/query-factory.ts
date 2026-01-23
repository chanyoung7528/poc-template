import {
  type DefaultError,
  type InfiniteData,
  infiniteQueryOptions,
  type QueryFunction,
  type QueryKey,
  queryOptions,
  type UndefinedInitialDataInfiniteOptions,
  type UndefinedInitialDataOptions,
  type UseInfiniteQueryOptions,
  type UseQueryOptions,
  useSuspenseQuery,
} from '@tanstack/react-query';

/**
 * Query Factory
 * React Query v5 최적화 Query 패턴
 */

/**
 * Query Options 생성
 */
export const createQuery = <TData, TParams = void, TError = DefaultError>(
  keyBase: readonly unknown[],
  fetcher: (params: TParams) => Promise<TData>,
  config?: Partial<Omit<UndefinedInitialDataOptions<TData, TError, TData, QueryKey>, 'queryKey' | 'queryFn'>>
) => {
  return (params: TParams extends void ? void : TParams) => {
    const queryKey: QueryKey = params === undefined || params === null ? [...keyBase] : [...keyBase, params];

    return queryOptions({
      queryKey,
      queryFn: () => fetcher(params as TParams),
      ...config,
    }) as UseQueryOptions<TData, TError, TData, QueryKey> & {
      queryKey: QueryKey;
      queryFn: QueryFunction<TData, QueryKey>;
    };
  };
};

/**
 * Suspense Query Hook 생성
 */
export const createSuspenseQuery = <TData, TParams = void, TError = DefaultError>(
  keyBase: readonly unknown[],
  fetcher: (params: TParams) => Promise<TData>,
  config?: Partial<Omit<UndefinedInitialDataOptions<TData, TError, TData, QueryKey>, 'queryKey' | 'queryFn'>>
) => {
  return (params: TParams extends void ? void : TParams) => {
    const queryKey: QueryKey = params === undefined || params === null ? [...keyBase] : [...keyBase, params];

    return useSuspenseQuery({
      queryKey,
      queryFn: () => fetcher(params as TParams),
      ...config,
    });
  };
};

/**
 * Infinite Query Options 생성
 */
export const createInfiniteQuery = <TData, TParams = void, TPageParam = number, TError = DefaultError>(
  keyBase: readonly unknown[],
  fetcher: (params: TParams & { pageParam: TPageParam }) => Promise<TData>,
  config: {
    initialPageParam: TPageParam;
    getNextPageParam: (lastPage: TData, allPages: TData[], lastPageParam: TPageParam, allPageParams: TPageParam[]) => TPageParam | undefined | null;
    getPreviousPageParam?: (firstPage: TData, allPages: TData[], firstPageParam: TPageParam, allPageParams: TPageParam[]) => TPageParam | undefined | null;
  } & Partial<
    Omit<
      UndefinedInitialDataInfiniteOptions<TData, TError, InfiniteData<TData, TPageParam>, QueryKey, TPageParam>,
      'queryKey' | 'queryFn' | 'initialPageParam' | 'getNextPageParam' | 'getPreviousPageParam'
    >
  >
) => {
  return (params: TParams extends void ? void : TParams) => {
    const queryKey: QueryKey = params === undefined || params === null ? [...keyBase] : [...keyBase, params];
    const baseParams = (params ?? {}) as Record<string, unknown>;

    const { initialPageParam, getNextPageParam, getPreviousPageParam, ...restConfig } = config;

    return infiniteQueryOptions({
      queryKey,
      queryFn: ({ pageParam }) => fetcher({ ...baseParams, pageParam } as TParams & { pageParam: TPageParam }),
      initialPageParam,
      getNextPageParam,
      getPreviousPageParam,
      ...restConfig,
    }) as UseInfiniteQueryOptions<TData, TError, InfiniteData<TData, TPageParam>, QueryKey, TPageParam> & {
      queryKey: QueryKey;
      queryFn: QueryFunction<TData, QueryKey, TPageParam>;
    };
  };
};

/**
 * Query Key Factory 생성
 */
type KeyDefinition = null | ((arg: unknown) => unknown);
type KeyArg<T> = T extends (arg: infer A) => unknown ? A : never;
type KeyReturn<T> = T extends (arg: unknown) => infer R ? R : never;

type QueryKeyResult<T extends Record<string, KeyDefinition>> = {
  [K in keyof T]: T[K] extends null
    ? () => readonly [string, K]
    : (arg: KeyArg<Exclude<T[K], null>>) => readonly [string, K] | readonly [string, K, KeyReturn<Exclude<T[K], null>>];
};

export const createQueryKeys = <T extends Record<string, KeyDefinition>>(base: string, keys: T): QueryKeyResult<T> => {
  const result = {} as QueryKeyResult<T>;

  (Object.keys(keys) as Array<keyof T>).forEach(key => {
    const keyFn = keys[key];

    if (!keyFn) {
      result[key] = (() => [base, key] as const) as QueryKeyResult<T>[typeof key];
      return;
    }

    const fn = keyFn as Exclude<T[typeof key], null>;

    result[key] = ((arg: KeyArg<typeof fn>) => {
      const transformed = fn(arg);
      return transformed !== undefined && transformed !== null ? ([base, key, transformed] as const) : ([base, key] as const);
    }) as QueryKeyResult<T>[typeof key];
  });

  return result;
};
