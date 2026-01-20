'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/shared/ui/Button';
import styles from './page.module.scss';

function DuplicateAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL 파라미터에서 정보 가져오기 (서버에서 리다이렉트할 때 전달됨)
  const provider = searchParams.get('provider') || '';
  const phone = searchParams.get('phone') || '';

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'kakao':
        return '카카오';
      case 'naver':
        return '네이버';
      case 'wellness':
        return '일반 회원가입';
      default:
        return provider;
    }
  };

  const handleGoToLogin = () => {
    router.push('/login');
  };

  const handleGoToSignup = () => {
    router.push('/signup');
  };

  // URL 파라미터가 없으면 에러 (서버에서 리다이렉트되지 않은 경우)
  if (!provider || !phone) {
    return (
      <div className={styles.container}>
        <div className={styles.content}>
          <p>잘못된 접근입니다.</p>
          <Button onClick={handleGoToSignup} className={styles.button}>
            회원가입으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <span className={styles.icon}>⚠️</span>
        </div>

        <h1 className={styles.title}>이미 가입된 계정입니다</h1>

        <div className={styles.infoBox}>
          <p className={styles.infoText}>
            입력하신 정보로 이미 가입된 계정이 있습니다.
          </p>
          <div className={styles.accountInfo}>
            <p className={styles.provider}>
              가입 경로: <strong>{getProviderName(provider)}</strong>
            </p>
            {phone && (
              <p className={styles.maskedId}>
                전화번호: <strong>{phone}</strong>
              </p>
            )}
          </div>
        </div>

        <p className={styles.description}>
          기존 계정으로 로그인하시거나, 다른 정보로 회원가입을 진행해주세요.
        </p>

        <div className={styles.buttonGroup}>
          <Button
            variant="primary"
            size="large"
            onClick={handleGoToLogin}
            className={styles.button}
          >
            로그인하기
          </Button>
          <Button
            variant="secondary"
            size="large"
            onClick={handleGoToSignup}
            className={styles.button}
          >
            다시 가입하기
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function DuplicateAccountPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DuplicateAccountContent />
    </Suspense>
  );
}
