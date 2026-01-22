'use client';

import { LoginForm } from '@/domains/auth/ui/login/LoginForm';
import { SocialLoginSection } from '../components/SocialLoginSection';
import { useLoginFlow } from '../hooks/useLoginFlow';
import styles from './LoginFlow.module.scss';

interface LoginFlowProps {
  onNavigateToSignup?: () => void;
}

export function LoginFlow({ onNavigateToSignup }: LoginFlowProps) {
  const { handleLogin, handleSocialLogin, isLoading, error, setStep } =
    useLoginFlow({ mode: "login" }); // ✅ 로그인 모드

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
          onKakaoLogin={() => handleSocialLogin('kakao')}
          onNaverLogin={() => handleSocialLogin('naver')}
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
