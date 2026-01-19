'use client';

import { useState } from 'react';
import { TermsAgreement } from '@/domains/auth/ui/terms-agreement/TermsAgreement';
import { SignupStepper } from '../components/SignupStepper';
import { useSignupFlow } from '../hooks/useSignupFlow';
import {
  validatePassword,
  validateNickname,
} from '@/domains/auth/model/auth.utils';
import styles from './SignupFlow.module.scss';

interface SignupFlowProps {
  onNavigateToLogin?: () => void;
}

export function SignupFlow({ onNavigateToLogin }: SignupFlowProps) {
  const {
    currentStep,
    isLoading,
    error,
    email,
    setEmail: setFlowEmail,
    handleTermsAgree,
    handleSendCode,
    handleVerifyCode,
    handleSignup,
  } = useSignupFlow();

  const [localEmail, setLocalEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    nickname: '',
  });
  const [showTermsError, setShowTermsError] = useState(false);

  const steps = [
    { label: '약관 동의', key: 'terms' },
    { label: 'PASS 인증', key: 'verify' },
    { label: '정보 입력', key: 'form' },
    { label: '완료', key: 'complete' },
  ];

  const currentStepIndex = steps.findIndex((step) => step.key === currentStep);

  const handleSendCodeClick = async () => {
    try {
      setFlowEmail(localEmail);
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

  const handleSignupSubmit = async () => {
    const passwordValidation = validatePassword(formData.password);
    const nicknameValidation = validateNickname(formData.nickname);

    if (!passwordValidation.isValid || !nicknameValidation.isValid) {
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    try {
      await handleSignup({
        email,
        password: formData.password,
        nickname: formData.nickname,
        isMinor: false,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'terms':
        return (
          <TermsAgreement
            onAgree={(agreed) => {
              handleTermsAgree(agreed);
              if (!agreed.terms || !agreed.privacy) {
                setShowTermsError(true);
              } else {
                setShowTermsError(false);
              }
            }}
            showError={showTermsError}
          />
        );

      case 'verify':
        return (
          <div className={styles.verifySection}>
            <div className={styles.formGroup}>
              <label className={styles.label}>이메일</label>
              <input
                type="email"
                value={localEmail}
                onChange={(e) => setLocalEmail(e.target.value)}
                className={styles.input}
                placeholder="example@email.com"
              />
            </div>
            <button
              onClick={handleSendCodeClick}
              className={styles.button}
              disabled={isLoading}
            >
              {isLoading ? '발송 중...' : '인증 코드 발송'}
            </button>

            {email && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.label}>인증 코드</label>
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className={styles.input}
                    placeholder="인증 코드 6자리"
                    maxLength={6}
                  />
                </div>
                <button
                  onClick={handleVerifyCodeClick}
                  className={styles.button}
                  disabled={isLoading}
                >
                  {isLoading ? '인증 중...' : '인증 확인'}
                </button>
              </>
            )}
          </div>
        );

      case 'form':
        return (
          <div className={styles.formSection}>
            <div className={styles.formGroup}>
              <label className={styles.label}>닉네임</label>
              <input
                type="text"
                value={formData.nickname}
                onChange={(e) =>
                  setFormData({ ...formData, nickname: e.target.value })
                }
                className={styles.input}
                placeholder="닉네임 (2-20자)"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>비밀번호</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className={styles.input}
                placeholder="비밀번호 (8자 이상, 영문/숫자/특수문자 포함)"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>비밀번호 확인</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className={styles.input}
                placeholder="비밀번호 확인"
              />
            </div>

            <button
              onClick={handleSignupSubmit}
              className={styles.button}
              disabled={isLoading}
            >
              {isLoading ? '가입 중...' : '회원가입 완료'}
            </button>
          </div>
        );

      case 'complete':
        return (
          <div className={styles.completeSection}>
            <svg
              className={styles.successIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
              <path
                d="M8 12l3 3 5-5"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h2 className={styles.completeTitle}>회원가입 완료!</h2>
            <p className={styles.completeMessage}>
              환영합니다. 곧 메인 페이지로 이동합니다.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.signupFlow}>
      <div className={styles.header}>
        <h1 className={styles.title}>회원가입</h1>
        <p className={styles.subtitle}>
          서비스 이용을 위해 회원가입을 진행해주세요
        </p>
      </div>

      <div className={styles.content}>
        {error && <div className={styles.errorAlert}>{error}</div>}

        <SignupStepper steps={steps} currentStep={currentStepIndex}>
          {renderStepContent()}
        </SignupStepper>
      </div>

      {onNavigateToLogin && currentStep !== 'complete' && (
        <div className={styles.footer}>
          <p className={styles.footerText}>
            이미 계정이 있으신가요?{' '}
            <button onClick={onNavigateToLogin} className={styles.footerLink}>
              로그인
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
