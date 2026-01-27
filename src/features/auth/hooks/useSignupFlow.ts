/**
 * @deprecated 회원가입 플로우
 * 
 * 신규 인증 시스템에서는 useGeneralSignupFlow 또는 useSnsAuthFlow를 사용합니다.
 */

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export type SignupStep = 'form' | 'verify' | 'complete';

interface UseSignupFlowReturn {
  currentStep: SignupStep;
  isLoading: boolean;
  error: string | null;
  email: string;
  setEmail: (email: string) => void;
  setStep: (step: SignupStep) => void;
  handleSignup: (data: any) => Promise<void>;
  handleSendCode: (email: string) => Promise<void>;
  handleVerifyCode: (email: string, code: string) => Promise<void>;
  handleTermsAgree?: () => Promise<void>;
}

/**
 * @deprecated 
 * 신규 인증 시스템:
 * - 일반 회원가입: useGeneralSignupFlow
 * - SNS 회원가입: useSnsAuthFlow
 */
export function useSignupFlow(): UseSignupFlowReturn {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<SignupStep>('form');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSignup = async (data: any) => {
    console.warn('useSignupFlow is deprecated. Use useGeneralSignupFlow or useSnsAuthFlow.');
  };

  const handleSendCode = async (emailValue: string) => {
    console.warn('useSignupFlow is deprecated.');
    setEmail(emailValue);
  };

  const handleVerifyCode = async (emailValue: string, code: string) => {
    console.warn('useSignupFlow is deprecated.');
  };

  const handleTermsAgree = async () => {
    console.warn('useSignupFlow is deprecated.');
  };

  return {
    currentStep,
    isLoading: false,
    error,
    email,
    setEmail,
    setStep: setCurrentStep,
    handleSignup,
    handleSendCode,
    handleVerifyCode,
    handleTermsAgree,
  };
}
