/**
 * Domain: Member - React Query Hooks
 * 
 * 역할: React Query hooks (데이터만)
 * - API 호출만
 * - 판단 없음
 * - 라우팅 없음
 */

import { useMutation, useQuery } from "@tanstack/react-query";
import { memberApi } from "./member.api";
import type {
  CheckUserStatusRequest,
  CheckSnsUserRequest,
  RegisterGeneralRequest,
  RegisterSnsRequest,
  LinkGeneralRequest,
  LinkSnsRequest,
  LoginGeneralRequest,
  LoginSnsRequest,
  FindLoginInfoRequest,
  CheckLoginIdRequest,
  ResetPasswordRequest,
  SaveAgreementsRequest,
} from "./member.types";

// ============================================
// 회원 상태 조회
// ============================================

export function useCheckUserStatus() {
  return useMutation({
    mutationFn: (data: CheckUserStatusRequest) =>
      memberApi.checkUserStatus(data),
  });
}

export function useCheckSnsUser() {
  return useMutation({
    mutationFn: (data: CheckSnsUserRequest) => memberApi.checkSnsUser(data),
  });
}

// ============================================
// 회원가입
// ============================================

export function useRegisterGeneral() {
  return useMutation({
    mutationFn: (data: RegisterGeneralRequest) =>
      memberApi.registerGeneral(data),
  });
}

export function useRegisterSns() {
  return useMutation({
    mutationFn: (data: RegisterSnsRequest) => memberApi.registerSns(data),
  });
}

// ============================================
// 계정 연동
// ============================================

export function useLinkGeneral() {
  return useMutation({
    mutationFn: (data: LinkGeneralRequest) => memberApi.linkGeneral(data),
  });
}

export function useLinkSns() {
  return useMutation({
    mutationFn: (data: LinkSnsRequest) => memberApi.linkSns(data),
  });
}

// ============================================
// 로그인
// ============================================

export function useLoginGeneral() {
  return useMutation({
    mutationFn: (data: LoginGeneralRequest) => memberApi.loginGeneral(data),
  });
}

export function useLoginSns() {
  return useMutation({
    mutationFn: (data: LoginSnsRequest) => memberApi.loginSns(data),
  });
}

export function useLogout() {
  return useMutation({
    mutationFn: () => memberApi.logout(),
  });
}

// ============================================
// 아이디/비밀번호 찾기
// ============================================

export function useFindLoginInfo() {
  return useMutation({
    mutationFn: (data: FindLoginInfoRequest) => memberApi.findLoginInfo(data),
  });
}

export function useCheckLoginId() {
  return useMutation({
    mutationFn: (data: CheckLoginIdRequest) => memberApi.checkLoginId(data),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (data: ResetPasswordRequest) => memberApi.resetPassword(data),
  });
}

// ============================================
// 약관 동의
// ============================================

export function useSaveAgreements() {
  return useMutation({
    mutationFn: (data: SaveAgreementsRequest) =>
      memberApi.saveAgreements(data),
  });
}

// ============================================
// 회원 탈퇴
// ============================================

export function useWithdraw() {
  return useMutation({
    mutationFn: () => memberApi.withdraw(),
  });
}
