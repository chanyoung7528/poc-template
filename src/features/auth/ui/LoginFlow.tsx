'use client';

import { LoginForm } from '@/domains/auth/ui/login/LoginForm';
import { SocialLoginSection } from '@/domains/auth/ui/social/SocialLoginSection';
import { useAuthLoginPage } from '../hooks/useAuthLoginPage';
import styles from './LoginFlow.module.scss';

interface LoginFlowProps {
  onNavigateToSignup?: () => void;
}

/**
 * 로그인 플로우 UI
 * 
 * 역할: UI 렌더링만 담당
 * - 모든 비즈니스 로직은 useAuthLoginPage 훅에 위임
 */
export function LoginFlow({ onNavigateToSignup }: LoginFlowProps) {
  const {
    handleLogin,
    handleKakaoLogin,
    handleNaverLogin,
    isLoading,
    error,
    setStep,
  } = useAuthLoginPage();

  return (
    <div className={styles.loginFlow}>
      <div className={styles.header}>
        <h1 className={styles.title}>로그인</h1>
        <p className={styles.subtitle}>간편하게 로그인하세요</p>
      </div>

      <div className={styles.content}>
        {error && <div className={styles.errorAlert}>{error}</div>}

        <LoginForm
          onSubmit={handleLogin}
          isLoading={isLoading}
          onForgotPassword={() => setStep('reset-password')}
        />

        <SocialLoginSection
          onKakaoLogin={handleKakaoLogin}
          onNaverLogin={handleNaverLogin}
          isLoading={isLoading}
          showDivider
        />
      </div>

      {onNavigateToSignup && (
        <div className={styles.footer}>
          <p className={styles.footerText}>
            아직 계정이 없으신가요?{' '}
            <button onClick={onNavigateToSignup} className={styles.footerLink}>
              회원가입
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
