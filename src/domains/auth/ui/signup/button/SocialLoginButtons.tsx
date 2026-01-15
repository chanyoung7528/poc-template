"use client";

import { WellnessIdButton } from "./WellnessIdButton";
import { SocialLoginButton } from "./SocialLoginButton";
import styles from "./SocialLoginButtons.module.scss";

interface SocialLoginButtonsProps {
  onWellnessId: () => void;
  onKakao: () => void;
  onNaver: () => void;
  onApple: () => void;
  disabled?: boolean;
}

export function SocialLoginButtons({
  onWellnessId,
  onKakao,
  onNaver,
  onApple,
  disabled = false,
}: SocialLoginButtonsProps) {
  return (
    <div className={styles.container}>
      <WellnessIdButton onClick={onWellnessId} disabled={disabled} />
      <SocialLoginButton
        provider="kakao"
        onClick={onKakao}
        disabled={disabled}
      />
      <SocialLoginButton
        provider="naver"
        onClick={onNaver}
        disabled={disabled}
      />
      <SocialLoginButton
        provider="apple"
        onClick={onApple}
        disabled={disabled}
      />
    </div>
  );
}
