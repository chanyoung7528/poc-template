"use client";

import styles from "./TermsAgreementTitle.module.scss";

export function TermsAgreementTitle() {
  return (
    <div className={styles.titleFrame}>
      <h2 className={styles.title}>이용약관</h2>
      <p className={styles.subtitle}>
        서비스 이용을 위해
        <br />
        동의가 필요해요.
      </p>
    </div>
  );
}
