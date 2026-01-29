"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoadingOverlay } from "@/domains/auth/ui/common/LoadingOverlay";
import { useSignupCompleteAnimation } from "@/shared/hooks/animations";
import { useSignupCompleteFlow } from "@/features/auth/hooks/useSignupCompleteFlow";
import { useGroupMatching } from "@/features/auth/hooks/useGroupMatching";
import { SignupCompleteView } from "@/features/auth/ui/SignupCompleteView";
import { useMemberStore } from "@/domains/member/model";

function SignupCompleteContent() {
  const router = useRouter();
  // member store에서 회원 정보 가져오기
  const member = useMemberStore((state) => state.member);
  
  // member가 없으면 회원가입 페이지로 리다이렉트
  useEffect(() => {
    if (!member) {
      router.push("/member/signup");
    }
  }, [member, router]);

  // member가 없으면 로딩 표시
  if (!member) {
    return <LoadingOverlay message="회원 정보를 불러오는 중..." />;
  }

  // oppbId를 wellnessId로 사용
  const wellnessId = member.oppbId;

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
