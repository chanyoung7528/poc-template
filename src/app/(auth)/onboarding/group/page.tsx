"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useOnboardingStore } from "@/domains/onboarding/hooks/useOnboardingStore";
import { OnBoardingLayout } from "@/domains/onboarding/ui/OnBoardingLayout";
import { Button } from "@/shared/ui/Button";
import { OnBoardingGroupView } from "@/domains/onboarding/ui/OnBoardingGroupView";
import { useGroupPageAnimation } from "@/domains/onboarding/hooks/useGroupPageAnimation";

import styles from "./page.module.scss";
import { Route } from "next";

export default function OnboardingGroupPage() {
  const router = useRouter();
  const { goToStep: _goToStep } = useOnboardingStore();
  const [isMatching, setIsMatching] = useState(false);
  const isMounted = useRef(false);

  const {
    headerRef,
    footerRef,
    skipButtonRef,
    buttonGroupTitleRef,
    matchingContentRef,
  } = useGroupPageAnimation({ isMatching });

  useEffect(() => {
    if (isMounted.current && isMatching) {
      const timer = setTimeout(() => {
        // goToStep('onboarding-allergy');
        router.push("/join/onboarding/group/complete" as Route);
      }, 3000);
      return () => clearTimeout(timer);
    }
    isMounted.current = true;
  }, [isMatching, router /*, goToStep*/]);

  const handleNext = () => {
    setIsMatching(true);
    // goToStep('onboarding-allergy');
    // router.push('/join/onboarding/allergy');
  };

  const buttonText = isMatching ? "매칭 중입니다..." : "소속 그룹 매칭하기";

  return (
    <OnBoardingLayout title="프로필 작성" showProgress currentStep={1}>
      <div className={styles.container}>
        {!isMatching && (
          <div ref={headerRef} className={styles.header}>
            <p className={styles.subTitle}>그룹 매칭</p>
            <h2 className={styles.title}>
              헬렌님,
              <br />
              가입하신 정보로 소속된 그룹이 있는지
              <br /> 한번 확인해볼까요?
            </h2>
            <p className={styles.description}>
              그룹이 있다면 추가 혜택도 함께
              <br />
              이용하실 수 있어요
            </p>
          </div>
        )}

        {isMatching && (
          <div ref={matchingContentRef} className={styles.matchingContent}>
            <OnBoardingGroupView />
          </div>
        )}

        <footer ref={footerRef} className={styles.footer}>
          {!isMatching && (
            <p ref={buttonGroupTitleRef} className={styles.buttonGroupTitle}>
              확인은 가입 시 제공하신 정보 내에서만 이루어져요
            </p>
          )}
          <div className={styles.buttonGroup}>
            <Button
              variant="default"
              size="full"
              onClick={handleNext}
              disabled={isMatching}
            >
              {buttonText}
            </Button>
            <Button
              ref={skipButtonRef}
              type="button"
              variant="ghost"
              size="full"
              className={styles.skipButton}
              onClick={() => router.push("/")}
            >
              건너띄기
            </Button>
          </div>
        </footer>
      </div>
    </OnBoardingLayout>
  );
}
