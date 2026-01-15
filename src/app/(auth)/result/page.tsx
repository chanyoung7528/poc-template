"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { MaskedAccountView } from "@/domains/auth/ui/common/MaskedAccountView";
import { Button } from "@/shared/ui/Button";
import styles from "./page.module.scss";

function AuthResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const maskedId = searchParams.get("maskedId");
  const provider = searchParams.get("provider");

  if (!maskedId) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>잘못된 접근입니다</h1>
          <Button onClick={() => router.push("/login")} fullWidth>
            로그인 페이지로 이동
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>이미 가입된 계정입니다</h1>

        <MaskedAccountView maskedId={maskedId} />

        <div className={styles.info}>
          <p className={styles.infoText}>
            {provider && `${provider.toUpperCase()}로 가입된 계정입니다.`}
          </p>
          <p className={styles.infoText}>해당 계정으로 로그인해주세요.</p>
        </div>

        <div className={styles.actions}>
          <Button onClick={() => router.push("/login")} fullWidth>
            로그인하기
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AuthResultPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <div className={styles.card}>
            <p>로딩 중...</p>
          </div>
        </div>
      }
    >
      <AuthResultContent />
    </Suspense>
  );
}
