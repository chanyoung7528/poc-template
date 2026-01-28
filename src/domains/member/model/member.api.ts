/**
 * Domain: Member - API
 * 
 * 역할: 회원 API 함수 정의 (순수 API 호출)
 * - 판단 없음
 * - 라우팅 없음
 * - 순수 데이터만
 */

import { apiClient } from "@/core/api/client";
import type {
  CheckUserStatusRequest,
  CheckUserStatusResponse,
  CheckSnsUserRequest,
  CheckSnsUserResponse,
  RegisterGeneralRequest,
  RegisterSnsRequest,
  LinkGeneralRequest,
  LinkSnsRequest,
  LoginGeneralRequest,
  LoginSnsRequest,
  FindLoginInfoRequest,
  FindLoginInfoResponse,
  CheckLoginIdRequest,
  CheckLoginIdResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  SaveAgreementsRequest,
  SaveAgreementsResponse,
  AuthSuccessResponse,
  WithdrawResponse,
} from "./member.types";

/**
 * Member API
 */
export const memberApi = {
  // ============================================
  // 회원 상태 조회
  // ============================================

  /**
   * 회원 상태 조회 (NICE 본인인증 후)
   * - 신규 회원: verificationToken 발급
   * - 기존 회원: 회원 정보 반환
   * - 연동 필요: linkToken 발급
   */
  checkUserStatus: (data: CheckUserStatusRequest) =>
    apiClient.post<CheckUserStatusResponse>(
      "/api/member/checkUserStatus",
      data
    ),

  /**
   * SNS 회원 조회
   * - 기존 회원: 회원 정보 반환
   * - 미가입: registerToken 발급
   * - 연동 필요: linkToken 발급
   */
  checkSnsUser: (data: CheckSnsUserRequest) =>
    apiClient.post<CheckSnsUserResponse>("/api/member/checkSnsUser", data),

  // ============================================
  // 회원가입
  // ============================================

  /**
   * 일반 회원가입
   */
  registerGeneral: (data: RegisterGeneralRequest) =>
    apiClient.post<AuthSuccessResponse>("/api/member/general", data),

  /**
   * SNS 회원가입
   */
  registerSns: (data: RegisterSnsRequest) =>
    apiClient.post<AuthSuccessResponse>("/api/member/sns/register", data),

  // ============================================
  // 계정 연동
  // ============================================

  /**
   * 일반 계정 연동 (SNS 계정에 일반 로그인 추가)
   */
  linkGeneral: (data: LinkGeneralRequest) =>
    apiClient.post<AuthSuccessResponse>("/api/member/linkGeneral", data),

  /**
   * SNS 계정 연동 (일반 계정에 SNS 로그인 추가)
   */
  linkSns: (data: LinkSnsRequest) =>
    apiClient.post<AuthSuccessResponse>("/api/member/sns/link", data),

  // ============================================
  // 로그인
  // ============================================

  /**
   * 일반 로그인
   */
  loginGeneral: (data: LoginGeneralRequest) =>
    apiClient.post<AuthSuccessResponse>("/api/member/login", data),

  /**
   * SNS 로그인
   */
  loginSns: (data: LoginSnsRequest) =>
    apiClient.post<AuthSuccessResponse>("/api/member/sns/check", data),

  /**
   * 로그아웃
   */
  logout: () => apiClient.post<{ success: boolean }>("/api/member/logout"),

  // ============================================
  // 아이디/비밀번호 찾기
  // ============================================

  /**
   * 아이디 찾기 (NICE 본인인증 후)
   */
  findLoginInfo: (data: FindLoginInfoRequest) =>
    apiClient.post<FindLoginInfoResponse>("/api/member/findLoginInfo", data),

  /**
   * 로그인 ID 중복 체크
   */
  checkLoginId: (data: CheckLoginIdRequest) =>
    apiClient.post<CheckLoginIdResponse>("/api/member/checkLoginId", data),

  /**
   * 비밀번호 재설정 (NICE 본인인증 후)
   */
  resetPassword: (data: ResetPasswordRequest) =>
    apiClient.post<ResetPasswordResponse>("/api/member/resetPassword", data),

  // ============================================
  // 약관 동의
  // ============================================

  /**
   * 약관 동의 저장
   */
  saveAgreements: (data: SaveAgreementsRequest) =>
    apiClient.post<SaveAgreementsResponse>("/api/member/agreements", data),

  // ============================================
  // 회원 탈퇴
  // ============================================

  /**
   * 회원 탈퇴
   */
  withdraw: () =>
    apiClient.post<WithdrawResponse>("/api/member/withdraw"),
};
