/**
 * Domain: Member - API
 * 
 * 역할: 회원 API 함수 정의 (순수 API 호출)
 * - 공통 Response 형식 사용 (ApiResponse<T>)
 * - data 필드만 반환
 */

import { apiClient } from "@/core/api/client";
import type { ApiResponse } from "@/core/api/types";
import type {
  CheckUserStatusRequest,
  CheckUserStatusData,
  CheckSnsUserRequest,
  CheckSnsUserData,
  RegisterGeneralRequest,
  RegisterGeneralData,
  RegisterSnsUserRequest,
  RegisterSnsUserData,
  LoginGeneralRequest,
  LoginGeneralData,
  CheckLoginIdRequest,
  CheckLoginIdData,
} from "./member.types";

/**
 * Member API
 * 
 * 모든 API는 공통 Response 형식을 사용:
 * {
 *   code: string,
 *   message: string,
 *   data: T,  // 실제 데이터
 *   succeeded: boolean,
 *   total: number,
 *   isJackson: boolean
 * }
 */
export const memberApi = {
  /**
   * 회원 상태 조회 (본인인증 후)
   * Response: ApiResponse<CheckUserStatusData>
   */
  checkUserStatus: (data: CheckUserStatusRequest) =>
    apiClient.post<ApiResponse<CheckUserStatusData>>(
      "/api/member/checkUserStatus",
      data
    ),

  /**
   * SNS 회원 조회
   * Response: ApiResponse<CheckSnsUserData>
   */
  checkSnsUser: (data: CheckSnsUserRequest) =>
    apiClient.post<ApiResponse<CheckSnsUserData>>(
      "/api/member/sns/check",
      data
    ),

  /**
   * 일반 회원가입
   * Response: ApiResponse<RegisterGeneralData>
   */
  registerGeneral: (data: RegisterGeneralRequest) =>
    apiClient.post<ApiResponse<RegisterGeneralData>>(
      "/api/member/general",
      data
    ),

  /**
   * SNS 회원가입
   * Response: ApiResponse<RegisterSnsUserData>
   */
  registerSnsUser: (data: RegisterSnsUserRequest) =>
    apiClient.post<ApiResponse<RegisterSnsUserData>>(
      "/api/member/sns/register",
      data
    ),

  /**
   * 일반 로그인
   * Response: ApiResponse<LoginGeneralData>
   */
  loginGeneral: (data: LoginGeneralRequest) =>
    apiClient.post<ApiResponse<LoginGeneralData>>(
      "/api/member/login",
      data
    ),

  /**
   * 로그인 ID 중복 체크
   * Response: ApiResponse<CheckLoginIdData>
   */
  checkLoginId: (data: CheckLoginIdRequest) =>
    apiClient.post<ApiResponse<CheckLoginIdData>>(
      "/api/member/checkLoginId",
      data
    ),
};
