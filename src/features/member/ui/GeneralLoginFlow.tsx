/**
 * Feature UI: Member - 일반 로그인 플로우
 *
 * 역할: 일반 로그인 UI 흐름
 * - Domain UI 조합
 * - Feature hook 사용
 */

"use client";

import { useGeneralLoginFlow } from "@/features/member/hooks";
import { LoginForm } from "@/domains/auth/ui/login/LoginForm";
import { SocialLoginSection } from "@/domains/auth/ui/social/SocialLoginSection";
import { useSnsAuthFlow } from "@/features/member/hooks";
import styles from "./GeneralLoginFlow.module.scss";

interface GeneralLoginFlowProps {
  onNavigateToSignup?: () => void;
  onNavigateToForgotPassword?: () => void;
}

export function GeneralLoginFlow({
  onNavigateToSignup,
  onNavigateToForgotPassword,
}: GeneralLoginFlowProps) {
  const { handleLogin, isLoggingIn } = useGeneralLoginFlow();
  const { handleSnsLoginSuccess, isLoggingIn: isSnsLoggingIn } = useSnsAuthFlow();

  // SNS 로그인 핸들러
  const handleKakaoLogin = () => {
    // TODO: 카카오 로그인 SDK 호출
    // 성공 시 handleSnsLoginSuccess 호출
    console.log("카카오 로그인");
  };

  const handleNaverLogin = () => {
    // TODO: 네이버 로그인 SDK 호출
    console.log("네이버 로그인");
  };

  return (
    <div className={styles.loginFlow}>
      <LoginForm
        onSubmit={(email, password) =>
          handleLogin({ wellnessId: email, password })
        }
        isLoading={isLoggingIn}
        onForgotPassword={onNavigateToForgotPassword}
      />

      <div className={styles.divider}>
        <span>또는</span>
      </div>

      <SocialLoginSection
        onKakaoLogin={handleKakaoLogin}
        onNaverLogin={handleNaverLogin}
        isLoading={isSnsLoggingIn}
      />

      {onNavigateToSignup && (
        <div className={styles.signupPrompt}>
          <span>계정이 없으신가요?</span>
          <button onClick={onNavigateToSignup} className={styles.signupLink}>
            회원가입
          </button>
        </div>
      )}
    </div>
  );
}
