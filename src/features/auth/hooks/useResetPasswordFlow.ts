/**
 * @deprecated 비밀번호 재설정 플로우
 * 
 * 신규 인증 시스템에서는 본인인증 기반으로 비밀번호 재설정을 구현해야 합니다.
 * 기존 이메일 인증 방식은 사용하지 않습니다.
 */

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export type ResetPasswordStep = 'verify' | 'reset' | 'complete';

interface UseResetPasswordFlowReturn {
  currentStep: ResetPasswordStep;
  isLoading: boolean;
  error: string | null;
  email: string;
  setEmail: (email: string) => void;
  handleSendCode: (email: string) => Promise<void>;
  handleVerifyCode: (code: string) => Promise<void>;
  handleResetPassword: (
    newPassword: string,
    verificationCode: string
  ) => Promise<void>;
}

/**
 * @deprecated 
 * 새로운 인증 시스템에서는 본인인증 기반 비밀번호 재설정을 사용합니다.
 */
export function useResetPasswordFlow(): UseResetPasswordFlowReturn {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<ResetPasswordStep>('verify');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSendCode = async (emailValue: string) => {
    console.warn('useResetPasswordFlow is deprecated. Implement new auth flow.');
    setEmail(emailValue);
  };

  const handleVerifyCode = async (code: string) => {
    console.warn('useResetPasswordFlow is deprecated. Implement new auth flow.');
    setCurrentStep('reset');
  };

  const handleResetPassword = async (
    newPassword: string,
    verificationCode: string
  ) => {
    console.warn('useResetPasswordFlow is deprecated. Implement new auth flow.');
    setCurrentStep('complete');
    router.push('/login');
  };

  return {
    currentStep,
    email,
    isLoading: false,
    error,
    setEmail,
    handleSendCode,
    handleVerifyCode,
    handleResetPassword,
  };
}
