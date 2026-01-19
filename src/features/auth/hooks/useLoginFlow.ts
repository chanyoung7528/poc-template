'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLogin } from '@/domains/auth/model/auth.queries';

export type LoginStep = 'login' | 'find-id' | 'reset-password';

interface UseLoginFlowReturn {
  currentStep: LoginStep;
  isLoading: boolean;
  error: string | null;
  setStep: (step: LoginStep) => void;
  handleLogin: (email: string, password: string) => Promise<void>;
  handleSocialLogin: (provider: 'kakao' | 'naver' | 'apple') => void;
}

export function useLoginFlow(): UseLoginFlowReturn {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<LoginStep>('login');
  const [error, setError] = useState<string | null>(null);

  const loginMutation = useLogin();

  const handleLogin = async (email: string, password: string) => {
    try {
      setError(null);
      await loginMutation.mutateAsync({ email, password });
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : '로그인에 실패했습니다');
    }
  };

  const handleSocialLogin = (provider: 'kakao' | 'naver' | 'apple') => {
    if (provider === 'kakao') {
      const kakaoAuthUrl = new URL('https://kauth.kakao.com/oauth/authorize');
      kakaoAuthUrl.searchParams.set(
        'client_id',
        process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID || ''
      );
      kakaoAuthUrl.searchParams.set(
        'redirect_uri',
        process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI || ''
      );
      kakaoAuthUrl.searchParams.set('response_type', 'code');
      window.location.href = kakaoAuthUrl.toString();
    } else if (provider === 'naver') {
      const state = Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('naver_state', state);

      const naverAuthUrl = new URL('https://nid.naver.com/oauth2.0/authorize');
      naverAuthUrl.searchParams.set('response_type', 'code');
      naverAuthUrl.searchParams.set(
        'client_id',
        process.env.NEXT_PUBLIC_NAVER_CLIENT_ID || ''
      );
      naverAuthUrl.searchParams.set(
        'redirect_uri',
        process.env.NEXT_PUBLIC_NAVER_REDIRECT_URI || ''
      );
      naverAuthUrl.searchParams.set('state', state);
      window.location.href = naverAuthUrl.toString();
    } else if (provider === 'apple') {
      // Apple 로그인 구현 예정
      console.log('Apple login not implemented yet');
    }
  };

  return {
    currentStep,
    isLoading: loginMutation.isPending,
    error,
    setStep: setCurrentStep,
    handleLogin,
    handleSocialLogin,
  };
}
