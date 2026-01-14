"use client";

import { PassAuthButton } from "@/domains/auth/ui/PassAuthButton";
import styles from "./page.module.scss";

export default function VerifyPage() {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.content}>
          <h1 className={styles.title}>PASS 본인인증</h1>
          <p className={styles.subtitle}>
            본인 인증을 위해 PASS 인증을 진행해주세요
          </p>

          <div className={styles.passSection}>
            <PassAuthButton />
          </div>

          <div className={styles.note}>
            <p className={styles.noteText}>
              * PASS 앱이 설치되어 있거나 통신사 인증이 가능해야 합니다
            </p>
            <p className={styles.noteText}>
              * 인증 완료 후 자동으로 다음 단계로 진행됩니다
            </p>
            <p className={styles.noteText}>
              * 테스트 환경에서는 실제 본인인증 없이 테스트 가능합니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
