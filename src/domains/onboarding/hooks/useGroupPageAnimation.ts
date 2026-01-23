import { gsap } from "gsap";
import { useEffect, useRef } from "react";

interface UseGroupPageAnimationProps {
  isMatching: boolean;
}

/**
 * 그룹 매칭 페이지 애니메이션 훅
 *
 * GSAP을 사용하여 다음 애니메이션을 제공:
 * 1. 페이지 진입 시 헤더와 footer 애니메이션
 * 2. 매칭 시작 시 버튼 이동 애니메이션
 */
export function useGroupPageAnimation({
  isMatching,
}: UseGroupPageAnimationProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const skipButtonRef = useRef<HTMLButtonElement>(null);
  const buttonGroupTitleRef = useRef<HTMLParagraphElement>(null);
  const matchingContentRef = useRef<HTMLDivElement>(null);
  const searchImageRef = useRef<HTMLImageElement>(null);

  // 페이지 진입 애니메이션
  useEffect(() => {
    console.log("isMatching", matchingContentRef.current);
    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // Footer: 아래에서 위로
      if (footerRef.current) {
        tl.fromTo(
          footerRef.current,
          {
            y: 100,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          0
        );
      }

      // Header: 위에서 아래로 (0.2초 딜레이)
      if (headerRef.current && !isMatching) {
        tl.fromTo(
          headerRef.current,
          {
            y: -20,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
          },
          0.2
        );
      }
    });

    return () => ctx.revert();
  }, []);

  // 매칭 상태 변경 애니메이션
  useEffect(() => {
    if (!isMatching) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: {
          ease: "power2.out",
        },
      });

      // 1. 헤더와 타이틀 동시에 페이드아웃
      if (headerRef.current) {
        tl.to(
          headerRef.current,
          {
            opacity: 0,
            y: -30,
            duration: 0.35,
          },
          0
        );
      }

      if (buttonGroupTitleRef.current) {
        tl.to(
          buttonGroupTitleRef.current,
          {
            opacity: 0,
            height: 0,
            marginBottom: 0,
            duration: 0.35,
          },
          0
        );
      }

      // 2. 건너뛰기 버튼 부드럽게 축소 (매칭하기 버튼이 내려가는 효과)
      if (skipButtonRef.current) {
        tl.to(
          skipButtonRef.current,
          {
            opacity: 0,
            height: 0,
            marginTop: 0,
            paddingTop: 0,
            paddingBottom: 0,
            duration: 0.45,
            ease: "power3.inOut",
          },
          0.1
        );
      }

      // 3. 검색 이미지 좌우 흔들림 애니메이션 (무한 반복)
      if (searchImageRef.current) {
        gsap.to(searchImageRef.current, {
          x: -15,
          duration: 0.8,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
          delay: 0.5,
        });
      }
    });

    return () => ctx.revert();
  }, [isMatching]);

  return {
    headerRef,
    footerRef,
    skipButtonRef,
    buttonGroupTitleRef,
    matchingContentRef,
    searchImageRef,
  };
}
