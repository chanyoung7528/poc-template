'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useResetPassword, useSendVerificationCode, useVerifyCode } from '@/domains/auth/model/auth.queries';

export type ResetPasswordStep = 'verify' | 'reset' | 'complete';

interface UseResetPasswordFlowReturn {
  currentStep: ResetPasswordStep;
  isLoading: boolean;
  error: string | null;
  email: string;
  setEmail: (email: string) => void;
  handleSendCode: (email: string) => Promise<void>;
  handleVerifyCode: (code: string) => Promise<void>;
  handleResetPassword: (newPassword: string, verificationCode: string) => Promise<void>;
}

export function useResetPasswordFlow(): UseResetPasswordFlowReturn {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<ResetPasswordStep>('verify');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const sendCodeMutation = useSendVerificationCode();
  const verifyCodeMutation = useVerifyCode();
  const resetPasswordMutation = useResetPassword();

  const handleSendCode = async (emailValue: string) => {
    try {
      setError(null);
      setEmail(emailValue);
      await sendCodeMutation.mutateAsync(emailValue);
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증 코드 발송에 실패했습니다');
      throw err;
    }
  };

  const handleVerifyCode = async (code: string) => {
    try {
      setError(null);
      await verifyCodeMutation.mutateAsync({ email, code });
      setCurrentStep('reset');
    } catch (err) {
      setError(err instanceof Error ? err.message : '인증 코드 검증에 실패했습니다');
      throw err;
    }
  };

  const handleResetPassword = async (newPassword: string, verificationCode: string) => {
    try {
      setError(null);
      await resetPasswordMutation.mutateAsync({
        email,
        newPassword,
        verificationCode,
      });
      setCurrentStep('complete');
      
      // 2초 후 로그인 페이지로 이동
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '비밀번호 재설정에 실패했습니다');
      throw err;
    }
  };

  return {
    currentStep,
    isLoading: sendCodeMutation.isPending || verifyCodeMutation.isPending || resetPasswordMutation.isPending,
    error,
    email,
    setEmail,
    handleSendCode,
    handleVerifyCode,
    handleResetPassword,
  };
}
