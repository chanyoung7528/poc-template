'use client';

import { PassAuthButton } from '@/domains/auth/ui/PassAuthButton';
import styles from './page.module.scss';

export default function VerifyPage() {
  const handlePassAuth = () => {
    // PASS 인증 SDK 호출
    console.log('PASS 인증 시작');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.content}>
          <h1 className={styles.title}>PASS 인증</h1>
          <p className={styles.subtitle}>
            본인 인증을 위해 PASS 인증을 진행해주세요
          </p>

          <div className={styles.passSection}>
            <PassAuthButton onClick={handlePassAuth} />
          </div>

          <div className={styles.note}>
            <p className={styles.noteText}>
              * PASS 앱이 설치되어 있어야 합니다
            </p>
            <p className={styles.noteText}>
              * 인증 완료 후 자동으로 다음 단계로 진행됩니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
