import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import type { Route } from "next";

interface UseSignupCompleteFlowProps {
  isMatching: boolean;
  actionsRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * 회원가입 완료 플로우 훅
 *
 * - 매칭 완료 후 자동 이동
 * - 건너뛰기 버튼 애니메이션
 */
export function useSignupCompleteFlow({
  isMatching,
  actionsRef,
}: UseSignupCompleteFlowProps) {
  const router = useRouter();
  const isMounted = useRef(false);

  // 매칭 완료 후 자동 이동 (주석 처리)
  useEffect(() => {
    if (isMounted.current && isMatching) {
      const timer = setTimeout(() => {
        router.push("/onboarding/group");
      }, 3000);
      return () => clearTimeout(timer);
    }
    isMounted.current = true;
  }, [isMatching, router]);

  const handleSkip = () => {
    // Button press animation
    if (actionsRef.current?.children[1]) {
      gsap.to(actionsRef.current.children[1], {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          router.push("/main" as Route);
        },
      });
    } else {
      router.push("/main" as Route);
    }
  };

  return {
    handleSkip,
  };
}
