"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/ui/Button";
import styles from "./page.module.scss";

interface DuplicateInfo {
  provider: string;
  maskedId: string;
}

export default function DuplicateAccountPage() {
  const router = useRouter();
  const [duplicateInfo, setDuplicateInfo] = useState<DuplicateInfo | null>(
    null
  );

  useEffect(() => {
    // 중복 검증 API 호출하여 정보 가져오기
    const fetchDuplicateInfo = async () => {
      try {
        const response = await fetch("/api/auth/wellness/check-duplicate", {
          method: "POST",
        });

        const data = await response.json();

        if (data.isDuplicate) {
          setDuplicateInfo({
            provider: data.provider,
            maskedId: data.maskedId,
          });
        } else {
          // 중복이 아니면 회원가입 페이지로
          router.push("/signup/credentials");
        }
      } catch (error) {
        console.error("중복 정보 조회 중 오류:", error);
      }
    };

    fetchDuplicateInfo();
  }, [router]);

  const getProviderName = (provider: string) => {
    switch (provider) {
      case "kakao":
        return "카카오";
      case "naver":
        return "네이버";
      case "wellness":
        return "일반 회원가입";
      default:
        return provider;
    }
  };

  const handleGoToLogin = () => {
    router.push("/login");
  };

  const handleGoToSignup = () => {
    router.push("/signup");
  };

  if (!duplicateInfo) {
    return (
      <div className={styles.container}>
        <p>확인 중...</p>
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
              가입 경로: <strong>{getProviderName(duplicateInfo.provider)}</strong>
            </p>
            {duplicateInfo.maskedId && (
              <p className={styles.maskedId}>
                아이디: <strong>{duplicateInfo.maskedId}</strong>
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
