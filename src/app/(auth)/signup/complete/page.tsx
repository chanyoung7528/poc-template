"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { LoadingOverlay } from "@/domains/auth/ui/common/LoadingOverlay";
import { useSignupCompleteAnimation } from "@/features/auth/hooks/useSignupCompleteAnimation";
import { useSignupCompleteFlow } from "@/features/auth/hooks/useSignupCompleteFlow";
import { useGroupMatching } from "@/features/auth/hooks/useGroupMatching";
import { SignupCompleteView } from "@/features/auth/ui/SignupCompleteView";

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
