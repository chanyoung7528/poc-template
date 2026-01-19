'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './AuthActionButton.module.scss';

interface AuthActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  title: string;
}

export function AuthActionButton({
  icon,
  label,
  title,
  className = '',
  ...props
}: AuthActionButtonProps) {
  return (
    <button className={`${styles.authActionButton} ${className}`} {...props}>
      <div className={styles.iconWrapper}>{icon}</div>
      <div className={styles.content}>
        <div className={styles.label}>{label}</div>
        <div className={styles.title}>{title}</div>
      </div>
    </button>
  );
}
