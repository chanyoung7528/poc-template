/**
 * Domain UI: PassAuthButton
 * 
 * 순수 재사용 가능한 본인인증 버튼 컴포넌트
 * - Feature 로직 의존성 제거
 * - onClick 핸들러를 props로 받음
 */

'use client';

import styles from './PassAuthButton.module.scss';

interface PassAuthButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function PassAuthButton({
  onClick,
  isLoading = false,
  disabled = false,
  children,
}: PassAuthButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={styles.passAuthButton}
      disabled={isLoading || disabled}
    >
      <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
      </svg>
      {children || (isLoading ? 'PASS 인증 중...' : 'PASS 인증으로 시작하기')}
    </button>
  );
}
