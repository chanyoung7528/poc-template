/**
 * Widget: OnboardingLayout
 * 
 * 역할: 온보딩 화면 전용 레이아웃
 * - 온보딩 플로우에만 사용되는 특화 레이아웃
 * - Widget 레이어에 속함 (특정 화면 전용)
 */

"use client";

import { useEffect, useState } from "react";
import styles from "./OnboardingLayout.module.scss";
import { Header } from "@/shared/ui/header";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBackButton?: boolean;
  showProgress?: boolean;
  currentStep?: number;
  totalStep?: number;
  onBack?: () => void;
  progress?: number;
}

export function OnboardingLayout({
  children,
  title,
  showBackButton = true,
  showProgress = false,
  currentStep = 1,
  totalStep = 4,
  onBack,
  progress: externalProgress,
}: OnboardingLayoutProps) {
  const isOnboardingStep = currentStep >= 1;
  const calculatedProgress = externalProgress ?? (currentStep / totalStep) * 100;
  
  const [progress, setProgress] = useState(calculatedProgress);

  useEffect(() => {
    if (!isOnboardingStep) return;

    const timer = setTimeout(() => {
      setProgress(calculatedProgress);
    }, 100);

    return () => clearTimeout(timer);
  }, [calculatedProgress, isOnboardingStep]);

  return (
    <div className={styles.container}>
      {/* Header */}
      <Header.Sub title={title} onBack={onBack} />

      {/* Progress Bar */}
      {showProgress && isOnboardingStep && (
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{
              width: `${progress}%`,
              transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            <div className={styles.progressGlow} />
          </div>
        </div>
      )}

      {/* Content */}
      <main className={styles.content}>{children}</main>
    </div>
  );
}
