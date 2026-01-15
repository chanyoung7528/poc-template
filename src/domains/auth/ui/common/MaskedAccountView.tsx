'use client';

import styles from './MaskedAccountView.module.scss';

interface MaskedAccountViewProps {
  maskedId: string;
}

export function MaskedAccountView({ maskedId }: MaskedAccountViewProps) {
  return (
    <div className={styles.maskedAccountView}>
      <h3 className={styles.title}>회원님의 아이디를 찾았습니다</h3>
      <p className={styles.maskedId}>{maskedId}</p>
      <p className={styles.description}>
        보안을 위해 일부 정보가 마스킹 처리되었습니다
      </p>
    </div>
  );
}
