'use client';

import { SignupTitle } from '@/domains/auth/ui/signup/SignupTitle';
import { SocialLoginButtons } from '@/domains/auth/ui/signup/button/SocialLoginButtons';
import styles from './page.module.scss';
import { useRouter } from 'next/navigation';
import { useLoginFlow } from '@/features/auth/hooks/useLoginFlow';
import { useAuthStore } from '@/store/authStore';

export default function SignupPage() {
  const { handleSocialLogin } = useLoginFlow();
  const router = useRouter();

  // Zustand Store 사용
  const startSignup = useAuthStore((state) => state.startSignup);

  const handleWellnessId = async () => {
    // Store에 일반 회원가입 시작 상태 저장
    startSignup('wellness');

    // 일반 회원가입 모드로 세션 시작
    try {
      const response = await fetch('/api/auth/wellness/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('일반 회원가입 초기화 실패:', data.error);
        alert('오류가 발생했습니다. 다시 시도해주세요.');
        return;
      }

      console.log('✅ 일반 회원가입 모드 시작');
      // 약관 동의 페이지로 이동
      router.push('/terms-agreement');
    } catch (error) {
      console.error('일반 회원가입 초기화 중 오류:', error);
      alert('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    }
  };

  const handleKakao = () => {
    startSignup('kakao');
    handleSocialLogin('kakao');
  };

  const handleNaver = () => {
    startSignup('naver');
    handleSocialLogin('naver');
  };

  const handleApple = () => {
    startSignup('apple');
    handleSocialLogin('apple');
  };

  return (
    <>
      <SignupTitle />
      <div className={styles.buttonContainer}>
        <SocialLoginButtons
          onWellnessId={handleWellnessId}
          onKakao={handleKakao}
          onNaver={handleNaver}
          onApple={handleApple}
        />
      </div>
    </>
  );
}
