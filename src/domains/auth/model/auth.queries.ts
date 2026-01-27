import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCurrentUser,
  logout,
  checkUserStatus,
  checkSnsUser,
  registerGeneral,
  registerSnsUser,
  loginGeneral,
  loginSns,
  linkGeneralAccount,
  linkSnsAccount,
  verifyCertification,
  loginWithKakaoNative,
  loginWithNaverNative,
} from "./auth.api";
import { useAuthStore } from "./auth.store";
import type {
  RegisterGeneralRequest,
  RegisterSnsRequest,
  LinkGeneralAccountRequest,
  LinkSnsAccountRequest,
  LoginGeneralRequest,
  SnsType,
} from "./auth.types";

// Query Keys
export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

// ==================== 사용자 정보 조회 ====================

/**
 * 현재 로그인한 사용자 정보를 조회하는 Query
 */
export function useCurrentUser() {
  const setUser = useAuthStore((state) => state.setUser);
  const setAuthStatus = useAuthStore((state) => state.setAuthStatus);

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      setAuthStatus("loading");
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

// ==================== 본인인증 ====================

/**
 * NICE 본인인증 결과를 서버에 전송하여 사용자 상태를 확인합니다
 * @returns verificationToken (신규) or linkToken (연동 필요)
 */
export function useCheckUserStatus() {
  return useMutation({
    mutationFn: (transactionId: string) => checkUserStatus(transactionId),
  });
}

/**
 * 아임포트 본인인증 검증 Mutation (레거시)
 * @deprecated useCheckUserStatus 사용 권장
 */
export function useVerifyCertification() {
  return useMutation({
    mutationFn: (impUid: string) => verifyCertification(impUid),
  });
}

// ==================== SNS 로그인/회원가입 ====================

/**
 * SNS 사용자 상태를 확인합니다
 * @returns registerToken (신규) or linkToken (연동 필요) or 로그인 성공
 */
export function useCheckSnsUser() {
  return useMutation({
    mutationFn: ({
      snsType,
      snsId,
      snsEmail,
    }: {
      snsType: SnsType;
      snsId: string;
      snsEmail?: string;
    }) => checkSnsUser(snsType, snsId, snsEmail),
  });
}

/**
 * SNS 간편 회원가입 Mutation
 */
export function useRegisterSns() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data: RegisterSnsRequest) => registerSnsUser(data),
    onSuccess: (data) => {
      if (data.user) {
        setUser(data.user);
        queryClient.setQueryData(authKeys.me(), data.user);
      }
    },
  });
}

/**
 * SNS 로그인 Mutation
 */
export function useLoginSns() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: ({ snsType, snsId }: { snsType: SnsType; snsId: string }) =>
      loginSns(snsType, snsId),
    onSuccess: (data) => {
      if (data.user) {
        setUser(data.user);
        queryClient.setQueryData(authKeys.me(), data.user);
      }
    },
  });
}

// ==================== 일반 로그인/회원가입 ====================

/**
 * 일반 회원가입 Mutation
 */
export function useRegisterGeneral() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data: RegisterGeneralRequest) => registerGeneral(data),
    onSuccess: (data) => {
      if (data.user) {
        setUser(data.user);
        queryClient.setQueryData(authKeys.me(), data.user);
      }
    },
  });
}

/**
 * 일반 로그인 Mutation
 */
export function useLoginGeneral() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data: LoginGeneralRequest) => loginGeneral(data),
    onSuccess: (data) => {
      if (data.user) {
        setUser(data.user);
        queryClient.setQueryData(authKeys.me(), data.user);
      }
    },
  });
}

// ==================== 계정 연동 ====================

/**
 * 일반 로그인 계정 연동 Mutation
 * (SNS 계정에 아이디/비밀번호 추가)
 */
export function useLinkGeneralAccount() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data: LinkGeneralAccountRequest) => linkGeneralAccount(data),
    onSuccess: (data) => {
      if (data.user) {
        setUser(data.user);
        queryClient.setQueryData(authKeys.me(), data.user);
      }
    },
  });
}

/**
 * SNS 로그인 계정 연동 Mutation
 * (일반 계정에 SNS 로그인 추가)
 */
export function useLinkSnsAccount() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data: LinkSnsAccountRequest) => linkSnsAccount(data),
    onSuccess: (data) => {
      if (data.user) {
        setUser(data.user);
        queryClient.setQueryData(authKeys.me(), data.user);
      }
    },
  });
}

// ==================== 네이티브 앱 지원 (레거시) ====================

/**
 * 네이티브 카카오 로그인 Mutation
 * @deprecated useCheckSnsUser + useLoginSns / useRegisterSns 플로우 사용 권장
 */
export function useKakaoNativeLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      id: string;
      nickname?: string;
      email?: string;
      profileImage?: string;
      cid?: string;
      mode?: "login" | "signup";
    }) => loginWithKakaoNative(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

/**
 * 네이티브 네이버 로그인 Mutation
 * @deprecated useCheckSnsUser + useLoginSns / useRegisterSns 플로우 사용 권장
 */
export function useNaverNativeLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      id: string;
      nickname?: string;
      email?: string;
      profileImage?: string;
      cid?: string;
      mode?: "login" | "signup";
    }) => loginWithNaverNative(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}
