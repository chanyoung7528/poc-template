import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchCurrentUser,
  logout,
  loginWithCredentials,
  signup,
  resetPassword,
  findIdByEmail,
  sendVerificationCode,
  verifyCode,
  verifyCertification,
  loginWithKakaoNative,
  loginWithNaverNative,
} from './auth.api';
import { useAuthStore } from './auth.store';
import type { SignupData, ResetPasswordData } from './auth.types';

// Query Keys
export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

/**
 * 현재 로그인한 사용자 정보를 조회하는 Query
 */
export function useCurrentUser() {
  const setUser = useAuthStore((state) => state.setUser);
  const setAuthStatus = useAuthStore((state) => state.setAuthStatus);

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      setAuthStatus('loading');
      const user = await fetchCurrentUser();
      setUser(user);
      return user;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * 로그아웃 Mutation
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
    },
  });
}

/**
 * 이메일/비밀번호 로그인 Mutation
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      loginWithCredentials(email, password),
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(authKeys.me(), data.user);
    },
  });
}

/**
 * 회원가입 Mutation
 */
export function useSignup() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data: SignupData) => signup(data),
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(authKeys.me(), data.user);
    },
  });
}

/**
 * 비밀번호 재설정 Mutation
 */
export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordData) => resetPassword(data),
  });
}

/**
 * 아이디 찾기 Mutation
 */
export function useFindId() {
  return useMutation({
    mutationFn: (email: string) => findIdByEmail(email),
  });
}

/**
 * 인증 코드 발송 Mutation
 */
export function useSendVerificationCode() {
  return useMutation({
    mutationFn: (email: string) => sendVerificationCode(email),
  });
}

/**
 * 인증 코드 검증 Mutation
 */
export function useVerifyCode() {
  const setTempToken = useAuthStore((state) => state.setTempToken);

  return useMutation({
    mutationFn: ({ email, code }: { email: string; code: string }) =>
      verifyCode(email, code),
    onSuccess: (data) => {
      setTempToken({
        token: data.token,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      });
    },
  });
}

/**
 * 아임포트 본인인증 검증 Mutation
 */
export function useVerifyCertification() {
  return useMutation({
    mutationFn: (impUid: string) => verifyCertification(impUid),
  });
}

/**
 * 네이티브 카카오 로그인 Mutation
 */
export function useKakaoNativeLogin() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data: {
      id: string;
      nickname?: string;
      email?: string;
      profileImage?: string;
      cid?: string;
    }) => loginWithKakaoNative(data),
    onSuccess: () => {
      // 로그인 성공 시 사용자 정보 다시 조회
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

/**
 * 네이티브 네이버 로그인 Mutation
 */
export function useNaverNativeLogin() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data: {
      id: string;
      nickname?: string;
      email?: string;
      profileImage?: string;
      cid?: string;
    }) => loginWithNaverNative(data),
    onSuccess: () => {
      // 로그인 성공 시 사용자 정보 다시 조회
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}
