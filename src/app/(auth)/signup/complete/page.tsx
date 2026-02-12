"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LoadingOverlay } from "@/domains/auth/ui/common/LoadingOverlay";
import { useSignupCompleteAnimation } from "@/shared/hooks/animations";
import { useSignupCompleteFlow } from "@/features/auth/hooks/useSignupCompleteFlow";
import { useGroupMatching } from "@/features/auth/hooks/useGroupMatching";
import { SignupCompleteView } from "@/features/auth/ui/SignupCompleteView";

// Dynamic rendering 강제 (useSearchParams 사용으로 인해 필요)
export const dynamic = "force-dynamic";

function SignupCompleteContent() {
  const searchParams = useSearchParams();
  const wellnessId = searchParams.get("wellnessId") || "welless04";

  // 애니메이션 훅
  const animationRefs = useSignupCompleteAnimation();

  // 그룹 매칭 상태
  const { isMatching, handleStartMatching } = useGroupMatching();

  // 비즈니스 로직 훅
  const { handleSkip } = useSignupCompleteFlow({
    isMatching,
    actionsRef: animationRefs.actionsRef,
  });

  return (
    <SignupCompleteView
      wellnessId={wellnessId}
      isMatching={isMatching}
      onStartMatching={handleStartMatching}
      onSkip={handleSkip}
      {...animationRefs}
    />
  );
}

export default function SignupCompletePage() {
  return (
    <Suspense fallback={<LoadingOverlay message="로딩 중..." />}>
      <SignupCompleteContent />
    </Suspense>
  );
}
