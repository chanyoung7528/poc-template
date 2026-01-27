"use client";

import { useOnboardingStore } from "../model/onboarding.store";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import styles from "./OnBoardingLayout.module.scss";
import { Header } from "@/shared/ui/header";

interface OnBoardingLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  showProgress?: boolean;
  currentStep?: number;
  totalStep?: number;
  onBack?: () => void;
}

export function OnBoardingLayout({
  children,
  title,
  showBackButton = true,
  showProgress = false,
  currentStep = 1,
  totalStep: _totalStep = 10,
  onBack: _onBack,
}: OnBoardingLayoutProps) {
  const router = useRouter();
  const {
    goBack: _goBack,
    canGoBack: _canGoBack,
    previousProgress,
    setPreviousProgress,
  } = useOnboardingStore();

  // 프로필 작성(Step 7 이상)일 때만 프로그레스 계산
  const isOnboardingStep = currentStep >= 1;
  const onboardingStep = isOnboardingStep ? currentStep - 1 : 0; // 1->1, 2->2, 3->3, 4->4
  const onboardingTotalSteps = 4;

  // 프로그레스 바를 4분할해서 100% 기준으로 %
  const [progress, setProgress] = useState(previousProgress);

  useEffect(() => {
    if (!isOnboardingStep) return;

    // (progress 0% ~ 100%)
    const targetProgressPercent = (onboardingStep / onboardingTotalSteps) * 100;

    // 트랜지션 효과를 위해 약간의 딜레이
    const timer = setTimeout(() => {
      setProgress(targetProgressPercent);
      setPreviousProgress(targetProgressPercent);
    }, 100);

    return () => clearTimeout(timer);
  }, [
    currentStep,
    isOnboardingStep,
    onboardingStep,
    onboardingTotalSteps,
    setPreviousProgress,
  ]);

  const handleBack = () => router.back();

  return (
    <div className={styles.container}>
      {/* Header */}
      <Header.Sub title={title} />

      {/* Progress Bar - 온보딩 작성(Step 1) 이후부터만 표시 */}
      {showProgress && isOnboardingStep && (
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{
              width: `${progress}%`,
              transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)", // 부드러운 효과, 필요시 css에서 커스텀
            }}
          >
            {/* 빛나는 효과 */}
            <div className={styles.progressGlow} />
          </div>
        </div>
      )}

      {/* Content */}
      <main className={styles.content}>{children}</main>
    </div>
  );
}
