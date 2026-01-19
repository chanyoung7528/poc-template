'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useSignup,
  useSendVerificationCode,
  useVerifyCode,
} from '@/domains/auth/model/auth.queries';
import type { SignupData } from '@/domains/auth/model/auth.types';

export type SignupStep = 'terms' | 'verify' | 'form' | 'complete';
export type UserStatus = 'new' | 'existing' | 'minor';

interface UseSignupFlowReturn {
  currentStep: SignupStep;
  userStatus: UserStatus | null;
  isLoading: boolean;
  error: string | null;
  email: string;
  setEmail: (email: string) => void;
  setStep: (step: SignupStep) => void;
  handleTermsAgree: (agreed: {
    terms: boolean;
    privacy: boolean;
    marketing: boolean;
  }) => void;
  handleSendCode: (email: string) => Promise<void>;
  handleVerifyCode: (code: string) => Promise<void>;
  handleSignup: (
    data: Omit<SignupData, 'termsAgreed' | 'privacyAgreed'>
  ) => Promise<void>;
}

export function useSignupFlow(): UseSignupFlowReturn {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<SignupStep>('terms');
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [email, setEmail] = useState('');
  const [termsAgreed, setTermsAgreed] = useState({
    terms: false,
    privacy: false,
    marketing: false,
  });
  const [error, setError] = useState<string | null>(null);

  const signupMutation = useSignup();
  const sendCodeMutation = useSendVerificationCode();
  const verifyCodeMutation = useVerifyCode();

  const handleTermsAgree = (agreed: {
    terms: boolean;
    privacy: boolean;
    marketing: boolean;
  }) => {
    setTermsAgreed(agreed);
    if (agreed.terms && agreed.privacy) {
      setCurrentStep('verify');
    }
  };

  const handleSendCode = async (emailValue: string) => {
    try {
      setError(null);
      setEmail(emailValue);
      await sendCodeMutation.mutateAsync(emailValue);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '인증 코드 발송에 실패했습니다'
      );
      throw err;
    }
  };

  const handleVerifyCode = async (code: string) => {
    try {
      setError(null);
      await verifyCodeMutation.mutateAsync({ email, code });

      // 실제로는 서버에서 사용자 상태를 받아와야 함
      // 여기서는 임시로 신규 사용자로 설정
      setUserStatus('new');
      setCurrentStep('form');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '인증 코드 검증에 실패했습니다'
      );
      throw err;
    }
  };

  const handleSignup = async (
    data: Omit<SignupData, 'termsAgreed' | 'privacyAgreed'>
  ) => {
    try {
      setError(null);
      await signupMutation.mutateAsync({
        ...data,
        termsAgreed: termsAgreed.terms,
        privacyAgreed: termsAgreed.privacy,
      });
      setCurrentStep('complete');

      // 2초 후 메인 페이지로 이동
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : '회원가입에 실패했습니다');
      throw err;
    }
  };

  return {
    currentStep,
    userStatus,
    isLoading:
      signupMutation.isPending ||
      sendCodeMutation.isPending ||
      verifyCodeMutation.isPending,
    error,
    email,
    setEmail,
    setStep: setCurrentStep,
    handleTermsAgree,
    handleSendCode,
    handleVerifyCode,
    handleSignup,
  };
}
