/**
 * Domain: Member - React Query Hooks
 * 
 * 역할: React Query hooks (데이터만)
 */

import { useMutation } from "@tanstack/react-query";
import { memberApi } from "./member.api";

/**
 * 회원 상태 조회
 */
export function useCheckUserStatus() {
  return useMutation({
    mutationFn: memberApi.checkUserStatus,
  });
}

/**
 * SNS 회원 조회
 */
export function useCheckSnsUser() {
  return useMutation({
    mutationFn: memberApi.checkSnsUser,
  });
}

/**
 * 일반 회원가입
 */
export function useRegisterGeneral() {
  return useMutation({
    mutationFn: memberApi.registerGeneral,
  });
}

/**
 * SNS 회원가입
 */
export function useRegisterSnsUser() {
  return useMutation({
    mutationFn: memberApi.registerSnsUser,
  });
}

/**
 * 일반 로그인
 */
export function useLoginGeneral() {
  return useMutation({
    mutationFn: memberApi.loginGeneral,
  });
}

/**
 * 로그인 ID 중복 체크
 */
export function useCheckLoginId() {
  return useMutation({
    mutationFn: memberApi.checkLoginId,
  });
}
