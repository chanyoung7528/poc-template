import { gsap } from "gsap";
import { useEffect, useRef } from "react";

/**
 * 회원가입 완료 페이지 초기 애니메이션 훅
 *
 * - 캐릭터 등장
 * - 콘페티 효과
 * - 텍스트 페이드인
 */
export function useSignupCompleteAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const benefitsRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const confettiRefs = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      // 1. Fade in container
      tl.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2 }
      );

      // 전체 애니메이션 시작 타이밍을 약간 늦춤
      tl.to({}, { duration: 0.2 });

      const simultaneousStart = "<";

      // 2. Character bounces in with scale
      tl.fromTo(
        characterRef.current,
        {
          scale: 0,
          y: -30,
          opacity: 0,
        },
        {
          scale: 1,
          y: 0,
          opacity: 1,
          duration: 0.4,
          ease: "back.out(1.7)",
        },
        simultaneousStart
      );

      // 3. Confetti 빵빠레 효과
      confettiRefs.current.forEach((confetti) => {
        if (!confetti) return;

        const angle = Math.random() * Math.PI * 2;
        const distance = 40 + Math.random() * 30;

        const endX = Math.cos(angle) * distance;
        const endY = Math.sin(angle) * distance;

        tl.fromTo(
          confetti,
          {
            x: 0,
            y: 0,
            scale: 0,
            rotation: 0,
            opacity: 0,
          },
          {
            x: endX,
            y: endY,
            scale: 1,
            rotation: Math.random() * 360 - 180,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          simultaneousStart
        );

        // 주변에서 떠다니는 효과
        gsap.to(confetti, {
          x: endX + (Math.random() - 0.5) * 20,
          y: endY + (Math.random() - 0.5) * 20,
          rotation: `+=${Math.random() * 60 - 30}`,
          duration: 2 + Math.random(),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 0.5,
        });
      });

      // 4. Title slides in
      tl.fromTo(
        titleRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3 },
        simultaneousStart
      );

      // 5. Subtitle fades in
      tl.fromTo(
        subtitleRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3 },
        simultaneousStart
      );

      // 6. Benefits message
      tl.fromTo(
        benefitsRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3 },
        simultaneousStart
      );

      // 7. Action buttons slide up
      tl.fromTo(
        actionsRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: "back.out(1.2)" },
        simultaneousStart
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return {
    containerRef,
    characterRef,
    titleRef,
    subtitleRef,
    benefitsRef,
    actionsRef,
    confettiRefs,
  };
}

