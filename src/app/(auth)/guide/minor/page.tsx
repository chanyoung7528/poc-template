'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/shared/ui/Button';
import styles from './page.module.scss';

export default function MinorGuidePage() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <svg
            className={styles.icon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >

            
            <circle cx="12" cy="12" r="10" strokeWidth="2" />
            <line
              x1="12"
              y1="8"
              x2="12"
              y2="12"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="12"
              y1="16"
              x2="12.01"
              y2="16"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <h1 className={styles.title}>만 14세 미만 가입 제한</h1>

        <div className={styles.content}>
          <p className={styles.description}>
            죄송합니다. 현재 본 서비스는 만 14세 이상부터 이용 가능합니다.
          </p>

          <div className={styles.infoBox}>
            <h2 className={styles.infoTitle}>
              만 14세 미만 개인정보 수집 제한
            </h2>
            <p className={styles.infoText}>
              정보통신망 이용촉진 및 정보보호 등에 관한 법률에 따라 만 14세 미만
              아동의 개인정보 수집 시 법정대리인의 동의가 필요합니다.
            </p>
          </div>

          <div className={styles.note}>
            <p className={styles.noteText}>
              * 만 14세가 되시면 다시 가입을 진행해주세요
            </p>
            <p className={styles.noteText}>
              * 문의사항은 고객센터로 연락주시기 바랍니다
            </p>
          </div>
        </div>

        <Button onClick={() => router.push('/')} fullWidth>
          홈으로 돌아가기
        </Button>
      </div>
    </div>
  );
}
