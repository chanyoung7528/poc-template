'use client';

import { useRouter } from 'next/navigation';
import { AuthActionButton } from '@/domains/auth/ui/AuthActionButton';
import styles from './page.module.scss';

export default function AuthPage() {
  const router = useRouter();

  const handleSignup = () => {
    router.push('/signup');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <div>
      {/* 캐릭터 이미지 */}

      <img
        src="/img/auth/auth-landing.png"
        alt="Wellness character"
        className={styles.characterImage}
      />

      {/* Wellness 타이틀 */}
      <div className={styles.titleFrame}>
        <h2 className={styles.wellnessTitle}>wellness</h2>
        <p className={styles.wellnessSubtitle}>
          바쁜 일상 속, 나를 챙기는 순간
        </p>
      </div>

      {/* 액션 버튼들 */}
      <div className={styles.buttonFrame}>
        <AuthActionButton
          className={styles.button}
          icon={
            <img src="/img/auth/giftbox.png" alt="" width={40} height={40} />
          }
          label="처음 방문하셨나요?"
          title="신규회원 가입하기"
          onClick={handleSignup}
        />
        <AuthActionButton
          className={styles.button}
          icon={
            <img src="/img/auth/auth-star.png" alt="" width={60} height={60} />
          }
          label="이미 회원이신가요?"
          title="지금 로그인하기"
          onClick={handleLogin}
        />
      </div>
    </div>
  );
}
