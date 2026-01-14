import { apiClient } from "@/shared/api/axios.instance";
import type {
  User,
  LoginResponse,
  SignupData,
  ResetPasswordData,
  CertificationResult,
} from "./auth.types";

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

/**
 * 이메일/비밀번호로 로그인합니다
 */
export async function loginWithCredentials(
  email: string,
  password: string
): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>("/api/auth/login", {
    email,
    password,
  });
  return response.data;
}

/**
 * 회원가입을 수행합니다
 */
export async function signup(data: SignupData): Promise<LoginResponse> {
  const response = await apiClient.post<LoginResponse>(
    "/api/auth/signup",
    data
  );
  return response.data;
}

/**
 * 비밀번호 재설정을 수행합니다
 */
export async function resetPassword(data: ResetPasswordData): Promise<void> {
  await apiClient.post("/api/auth/reset-password", data);
}

/**
 * 이메일로 아이디 찾기를 수행합니다
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

/**
 * 인증 코드를 발송합니다
 */
export async function sendVerificationCode(email: string): Promise<void> {
  await apiClient.post("/api/auth/send-code", { email });
}

/**
 * 인증 코드를 검증합니다
 */
export async function verifyCode(
  email: string,
  code: string
): Promise<{ token: string }> {
  const response = await apiClient.post<{ token: string }>(
    "/api/auth/verify-code",
    {
      email,
      code,
    }
  );
  return response.data;
}

/**
 * 아임포트 본인인증 결과를 서버에 전송하여 검증합니다
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
