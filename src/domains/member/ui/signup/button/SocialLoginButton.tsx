'use client';

import Image from 'next/image';
import styles from './SocialLoginButton.module.scss';

export type SocialProvider = 'kakao' | 'naver' | 'apple';

interface SocialLoginButtonProps {
  provider: SocialProvider;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

const providerConfig = {
  kakao: {
    icon: '/img/auth/kakao.png',
    label: '카카오로 시작하기',
    alt: '카카오',
  },
  naver: {
    icon: '/img/auth/naver.png',
    label: '네이버로 시작하기',
    alt: '네이버',
  },
  apple: {
    icon: '/img/auth/apple.png',
    label: 'Apple ID로 시작하기',
    alt: '애플',
  },
} as const;

export function SocialLoginButton({
  provider,
  onClick,
  disabled = false,
  className = '',
}: SocialLoginButtonProps) {
  const config = providerConfig[provider];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${styles.socialLoginButton} ${styles[provider]} ${className}`}
    >
      <Image
        src={config.icon}
        alt={config.alt}
        width={24}
        height={24}
        className={styles.icon}
      />
      <span>{config.label}</span>
    </button>
  );
}
