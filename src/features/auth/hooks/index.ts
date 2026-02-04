/**
 * Auth Feature - Hooks Index
 * 
 * 권장 사용 패턴:
 * - 로그인 페이지: useAuthLoginPage
 * - 회원가입 페이지: useAuthSignupPage
 * - 일반 로그인 플로우: useGeneralLoginFlow
 * - SNS 로그인 플로우: useSnsLoginFlow
 * - 일반 회원가입 플로우: useGeneralSignupFlow
 * - SNS 회원가입 플로우: useSnsSignupFlow
 */

// ✅ 페이지 레벨 훅
export { useAuthLoginPage } from "./useAuthLoginPage";
export { useAuthSignupPage } from "./useAuthSignupPage";

// ✅ 일반 로그인/회원가입 플로우
export { useGeneralLoginFlow } from "./useGeneralLoginFlow";
export { useGeneralSignupFlow } from "./useGeneralSignupFlow";

// ✅ SNS 로그인/회원가입 플로우
export { useSnsLoginFlow } from "./useSnsLoginFlow";
export { useSnsSignupFlow } from "./useSnsSignupFlow";

// ⚠️ Deprecated - 너무 복잡하여 분리됨
export { useLoginFlow } from "./useLoginFlow";

// 기타 플로우
export { useCredentialsAuth } from "./useCredentialsAuth";
export { usePortOnePass } from "./usePortOnePass";
export { useResetPasswordFlow } from "./useResetPasswordFlow";
export { useSignupCompleteFlow } from "./useSignupCompleteFlow";
export { useSignupFlow } from "./useSignupFlow";
export { useSnsAuthFlow } from "./useSnsAuthFlow";
export { useWellnessSignup } from "./useWellnessSignup";
export { useGroupMatching } from "./useGroupMatching";
