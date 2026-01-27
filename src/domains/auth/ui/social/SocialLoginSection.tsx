'use client';

import styles from './SocialLoginSection.module.scss';

interface SocialLoginSectionProps {
  onKakaoLogin: () => void;
  onNaverLogin: () => void;
  onAppleLogin?: () => void;
  isLoading?: boolean;
  showDivider?: boolean;
}

export function SocialLoginSection({
  onKakaoLogin,
  onNaverLogin,
  onAppleLogin,
  isLoading,
  showDivider = false,
}: SocialLoginSectionProps) {
  return (
    <div className={styles.socialLoginSection}>
      {showDivider && (
        <div className={styles.divider}>
          <span className={styles.dividerText}>또는</span>
        </div>
      )}

      <h3 className={styles.title}>간편 로그인</h3>

      <button
        type="button"
        onClick={onKakaoLogin}
        className={`${styles.socialButton} ${styles.kakaoButton}`}
        disabled={isLoading}
      >
        <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z" />
        </svg>
        카카오로 로그인
      </button>

      <button
        type="button"
        onClick={onNaverLogin}
        className={`${styles.socialButton} ${styles.naverButton}`}
        disabled={isLoading}
      >
        <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.273 12.845L7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727z" />
        </svg>
        네이버로 로그인
      </button>

      {onAppleLogin && (
        <button
          type="button"
          onClick={onAppleLogin}
          className={`${styles.socialButton} ${styles.appleButton}`}
          disabled={isLoading}
        >
          <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          Apple로 로그인
        </button>
      )}

      <p className={styles.note}>
        * 동일한 이메일로는 하나의 플랫폼만 가입 가능합니다
      </p>
    </div>
  );
}
