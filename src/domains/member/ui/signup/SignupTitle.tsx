'use client';

import styles from './SignupTitle.module.scss';

export function SignupTitle() {
  return (
    <div className={styles.titleFrame}>
      <h2 className={styles.title}>안녕하세요!</h2>
      <p className={styles.subtitle}>
        wellness에서 나만의
        <br />
        건강 기록을 시작해 보세요.
      </p>
    </div>
  );
}
