import { apiClient } from "@/shared/api/axios.instance";
import type {
  User,
  AuthSuccessResponse,
  CheckUserStatusResponse,
  CheckSnsUserResponse,
  RegisterGeneralRequest,
  RegisterSnsRequest,
  LinkGeneralAccountRequest,
  LinkSnsAccountRequest,
  LoginGeneralRequest,
  CertificationResult,
  SnsType,
} from "./auth.types";

// ==================== 인증 상태 조회 ====================

/**
 * 현재 로그인한 사용자 정보를 조회합니다
 */
export async function fetchCurrentUser(): Promise<User | null> {
  try {
    const response = await apiClient.get<{ user: User }>("/api/auth/me");
    return response.data.user;
  } catch (error) {
    console.error("사용자 정보 조회 실패:", error);
    return null;
  }
}

/**
 * 로그아웃을 수행합니다
 */
export async function logout(): Promise<void> {
  await apiClient.post("/api/auth/logout");
}

// ==================== 본인인증 ====================

/**
 * NICE 본인인증 결과를 서버에 전송하여 사용자 상태를 확인합니다
 * @param transactionId NICE 본인인증 거래 ID (imp_uid)
 * @returns 사용자 상태 및 발급된 토큰
 */
export async function checkUserStatus(
  transactionId: string
): Promise<CheckUserStatusResponse> {
  const response = await apiClient.post<CheckUserStatusResponse>(
    "/api/auth/check-user-status",
    { transactionId }
  );
  return response.data;
}

/**
 * 아임포트 본인인증 결과를 서버에 전송하여 검증합니다 (레거시)
 * @deprecated checkUserStatus 사용 권장
 */
export async function verifyCertification(
  impUid: string
): Promise<CertificationResult> {
  const response = await apiClient.post<CertificationResult>(
    "/api/auth/verify-certification",
    {
      imp_uid: impUid,
    }
  );
  return response.data;
}

// ==================== SNS 로그인/회원가입 ====================

/**
 * SNS 사용자 상태를 확인합니다
 * @param snsType SNS 유형 (KAKAO, NAVER, APPLE)
 * @param snsId SNS 식별자
 * @param snsEmail SNS 이메일
 * @returns 사용자 상태 및 발급된 토큰
 */
export async function checkSnsUser(
  snsType: SnsType,
  snsId: string,
  snsEmail?: string
): Promise<CheckSnsUserResponse> {
  const response = await apiClient.post<CheckSnsUserResponse>(
    "/api/auth/check-sns-user",
    {
      snsType,
      snsId,
      snsEmail,
    }
  );
  return response.data;
}

/**
 * SNS 간편 회원가입을 수행합니다
 * @param data registerToken + transactionId + 약관 동의
 * @returns 인증 성공 응답
 */
export async function registerSnsUser(
  data: RegisterSnsRequest
): Promise<AuthSuccessResponse> {
  const response = await apiClient.post<AuthSuccessResponse>(
    "/api/auth/register-sns",
    data
  );
  return response.data;
}

/**
 * SNS 로그인을 수행합니다
 * @param snsType SNS 유형
 * @param snsId SNS 식별자
 * @returns 인증 성공 응답
 */
export async function loginSns(
  snsType: SnsType,
  snsId: string
): Promise<AuthSuccessResponse> {
  const response = await apiClient.post<AuthSuccessResponse>(
    "/api/auth/login-sns",
    {
      snsType,
      snsId,
    }
  );
  return response.data;
}

// ==================== 일반 로그인/회원가입 ====================

/**
 * 일반 회원가입을 수행합니다
 * @param data verificationToken + 회원정보 + 약관 동의
 * @returns 인증 성공 응답
 */
export async function registerGeneral(
  data: RegisterGeneralRequest
): Promise<AuthSuccessResponse> {
  const response = await apiClient.post<AuthSuccessResponse>(
    "/api/auth/register-general",
    data
  );
  return response.data;
}

/**
 * 일반 로그인을 수행합니다
 * @param data wellnessId + password
 * @returns 인증 성공 응답
 */
export async function loginGeneral(
  data: LoginGeneralRequest
): Promise<AuthSuccessResponse> {
  const response = await apiClient.post<AuthSuccessResponse>(
    "/api/auth/login-general",
    data
  );
  return response.data;
}

// ==================== 계정 연동 ====================

/**
 * 일반 로그인 계정을 연동합니다
 * (SNS 계정에 아이디/비밀번호 추가)
 * @param data linkToken + wellnessId + password
 * @returns 인증 성공 응답
 */
export async function linkGeneralAccount(
  data: LinkGeneralAccountRequest
): Promise<AuthSuccessResponse> {
  const response = await apiClient.post<AuthSuccessResponse>(
    "/api/auth/link-general",
    data
  );
  return response.data;
}

/**
 * SNS 로그인 계정을 연동합니다
 * (일반 계정에 SNS 로그인 추가)
 * @param data linkToken + registerToken
 * @returns 인증 성공 응답
 */
export async function linkSnsAccount(
  data: LinkSnsAccountRequest
): Promise<AuthSuccessResponse> {
  const response = await apiClient.post<AuthSuccessResponse>(
    "/api/auth/link-sns",
    data
  );
  return response.data;
}

// ==================== 기타 ====================

/**
 * Wellness ID 중복 확인을 수행합니다
 * @param wellnessId 확인할 아이디
 * @returns true면 중복, false면 사용 가능
 */
export async function checkWellnessIdDuplicate(
  wellnessId: string
): Promise<boolean> {
  try {
    const response = await apiClient.get<{
      isDuplicate: boolean;
      message: string;
    }>(`/api/auth/wellness/check-id`, {
      params: { wellnessId },
    });
    return response.data.isDuplicate;
  } catch (error) {
    console.error("아이디 중복 확인 중 오류:", error);
    throw error;
  }
}

/**
 * 이메일로 아이디 찾기를 수행합니다 (레거시)
 * @deprecated 새로운 인증 플로우에서는 사용하지 않음
 */
export async function findIdByEmail(
  email: string
): Promise<{ maskedId: string }> {
  const response = await apiClient.post<{ maskedId: string }>(
    "/api/auth/find-id",
    { email }
  );
  return response.data;
}

// ==================== 네이티브 앱 지원 (레거시) ====================

/**
 * 네이티브 앱에서 받은 카카오 로그인 데이터를 서버로 전송합니다
 * @deprecated checkSnsUser + loginSns / registerSnsUser 플로우 사용 권장
 */
export async function loginWithKakaoNative(data: {
  id: string;
  nickname?: string;
  email?: string;
  profileImage?: string;
  cid?: string;
  mode?: "login" | "signup";
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
}): Promise<{ success: boolean; redirectUrl: string; isNewUser: boolean }> {
  const response = await apiClient.post<{
    success: boolean;
    redirectUrl: string;
    isNewUser: boolean;
  }>("/api/auth/kakao/native", data);
  return response.data;
}

/**
 * 네이티브 앱에서 받은 네이버 로그인 데이터를 서버로 전송합니다
 * @deprecated checkSnsUser + loginSns / registerSnsUser 플로우 사용 권장
 */
export async function loginWithNaverNative(data: {
  id: string;
  nickname?: string;
  email?: string;
  profileImage?: string;
  cid?: string;
  mode?: "login" | "signup";
  accessToken?: string;
  refreshToken?: string;
  tokenType?: string;
  expiresIn?: number;
}): Promise<{ success: boolean; redirectUrl: string; isNewUser: boolean }> {
  const response = await apiClient.post<{
    success: boolean;
    redirectUrl: string;
    isNewUser: boolean;
  }>("/api/auth/naver/native", data);
  return response.data;
}
