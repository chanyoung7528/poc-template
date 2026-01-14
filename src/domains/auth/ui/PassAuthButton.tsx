'use client';

import styles from './PassAuthButton.module.scss';

interface PassAuthButtonProps {
  onClick: () => void;
  isLoading?: boolean;
}

export function PassAuthButton({ onClick, isLoading }: PassAuthButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={styles.passAuthButton}
      disabled={isLoading}
    >
      <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z" />
      </svg>
      {isLoading ? 'PASS 인증 중...' : 'PASS 인증으로 시작하기'}
    </button>
  );
}
