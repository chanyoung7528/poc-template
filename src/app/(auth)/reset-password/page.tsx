'use client';

import { useState } from 'react';
import { useResetPasswordFlow } from '@/features/auth/hooks/useResetPasswordFlow';
import { validatePassword } from '@/domains/auth/model/auth.utils';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import styles from './page.module.scss';

export default function ResetPasswordPage() {
  const {
    currentStep,
    isLoading,
    error,
    email,
    setEmail,
    handleSendCode,
    handleVerifyCode,
    handleResetPassword,
  } = useResetPasswordFlow();

  const [localEmail, setLocalEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSendCodeClick = async () => {
    try {
      setEmail(localEmail);
      await handleSendCode(localEmail);
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyCodeClick = async () => {
    try {
      await handleVerifyCode(verificationCode);
    } catch (err) {
      console.error(err);
    }
  };

  const handleResetClick = async () => {
    const passwordValidation = validatePassword(password);
    
    if (!passwordValidation.isValid) {
      return;
    }

    if (password !== confirmPassword) {
      return;
    }

    try {
      await handleResetPassword(password, verificationCode);
    } catch (err) {
      console.error(err);
    }
  };

  const renderContent = () => {
    switch (currentStep) {
      case 'verify':
        return (
          <div className={styles.content}>
            <h1 className={styles.title}>비밀번호 재설정</h1>
            <p className={styles.subtitle}>
              가입하신 이메일로 인증 코드를 발송해드립니다
            </p>

            <Input
              label="이메일"
              type="email"
              value={localEmail}
              onChange={(e) => setLocalEmail(e.target.value)}
              placeholder="example@email.com"
              required
            />

            <Button onClick={handleSendCodeClick} disabled={isLoading} fullWidth>
              {isLoading ? '발송 중...' : '인증 코드 발송'}
            </Button>

            {email && (
              <>
                <Input
                  label="인증 코드"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="인증 코드 6자리"
                  maxLength={6}
                  required
                />

                <Button onClick={handleVerifyCodeClick} disabled={isLoading} fullWidth>
                  {isLoading ? '인증 중...' : '인증 확인'}
                </Button>
              </>
            )}
          </div>
        );

      case 'reset':
        return (
          <div className={styles.content}>
            <h1 className={styles.title}>새 비밀번호 설정</h1>
            <p className={styles.subtitle}>
              새로운 비밀번호를 입력해주세요
            </p>

            <Input
              label="새 비밀번호"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호 (8자 이상, 영문/숫자/특수문자 포함)"
              required
            />

            <Input
              label="비밀번호 확인"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="비밀번호 확인"
              required
            />

            <Button onClick={handleResetClick} disabled={isLoading} fullWidth>
              {isLoading ? '재설정 중...' : '비밀번호 재설정'}
            </Button>
          </div>
        );

      case 'complete':
        return (
          <div className={styles.completeContent}>
            <svg className={styles.successIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path d="M8 12l3 3 5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h1 className={styles.title}>비밀번호 재설정 완료</h1>
            <p className={styles.subtitle}>
              곧 로그인 페이지로 이동합니다
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {error && <div className={styles.errorAlert}>{error}</div>}
        {renderContent()}
      </div>
    </div>
  );
}
