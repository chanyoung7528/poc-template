'use client';

import styles from './WellnessIdButton.module.scss';

interface WellnessIdButtonProps {
  onClick: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function WellnessIdButton({
  onClick,
  disabled = false,
  className = '',
  children = 'Wellness ID로 시작하기',
}: WellnessIdButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${styles.wellnessIdButton} ${className}`}
    >
      {children}
    </button>
  );
}
