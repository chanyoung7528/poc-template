import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export function useAuthAnimation() {
  // Scene refs
  const splashTitleRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const characterImageRef = useRef<HTMLDivElement>(null);

  const titleFrameRef = useRef<HTMLDivElement>(null);
  const buttonFrameRef = useRef<HTMLDivElement>(null);

  // 캐릭터 이미지 refs (4개 모두 - 크로스 페이드용)
  const char1Ref = useRef<HTMLImageElement>(null);
  const char2Ref = useRef<HTMLImageElement>(null);
  const char3Ref = useRef<HTMLImageElement>(null);
  const char4Ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 초기 상태 설정: 모든 애니메이션 요소를 즉시 숨김 (FOUC 방지)
      gsap.set(characterImageRef.current, {
        opacity: 0,
      });

      gsap.set(
        [titleFrameRef.current, buttonFrameRef.current, sectionRef.current],
        {
          opacity: 0,
          y: "100vh",
        }
      );

      gsap.set(
        [
          char1Ref.current,
          char2Ref.current,
          char3Ref.current,
          char4Ref.current,
        ],
        {
          opacity: 0,
        }
      );

      // 🎬 Main Timeline: 전체 연출을 씬(Scene)처럼 구성
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      // [ Scene 1 ] 진입 - Hero Intro Animation
      // 타이틀이 더 높은 위치(-60px)에서 시작하여 원래 위치로
      tl.fromTo(
        splashTitleRef.current,
        {
          opacity: 0,
          y: -60,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
        }
      );

      // 잠시 대기
      tl.to({}, { duration: 0.6 });

      // [ Scene 2 ] 교차 모션 (Cross Motion)
      // 타이틀이 크게 밑으로 내려가면서 페이드아웃
      // 동시에 하단 섹션이 위로 올라옴 (titleFrame과 button은 아직 보이지 않음)
      tl.to(
        splashTitleRef.current,
        {
          y: 250, // 더 멀리 이동 (더 명확한 퇴장)
          opacity: 0,
          duration: 1.4,
          ease: "power3.inOut",
        },
        "crossMotion"
      )
        .fromTo(
          sectionRef.current,
          {
            y: "100vh",
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 1.4,
            ease: "power3.out",
          },
          "crossMotion" // splashTitle 퇴장과 동시에 시작
        )
        .to(
          characterImageRef.current,
          {
            opacity: 1,
            duration: 0.6,
          },
          "crossMotion+=0.4" // section이 조금 올라온 후 캐릭터 fade-in
        );

      // [ Scene 3 ] 캐릭터 Frame Animation (1→2→3→4) - 부드러운 크로스 페이드

      // 1초 대기(1 등장) → 1→2 → 2→3 → 3→4
      tl.to(char1Ref.current, { opacity: 1, duration: 0, ease: "none" }) // 1 먼저 보이게
        .to({}, { duration: 0.7 }) // 1초 대기 (0.7sec 추천: 2프레임 크로스 느낌)
        .to(
          char1Ref.current,
          { opacity: 0, duration: 0.4, ease: "power2.inOut" },
          "char1to2"
        )
        .to(
          char2Ref.current,
          { opacity: 1, duration: 0.4, ease: "power2.inOut" },
          "char1to2"
        )
        .to({}, { duration: 0.6 }) // 1초 대기 (0.4초 전환 + 0.6초 = 1초)
        // 2 → 3
        .to(
          char2Ref.current,
          { opacity: 0, duration: 0.4, ease: "power2.inOut" },
          "char2to3"
        )
        .to(
          char3Ref.current,
          { opacity: 1, duration: 0.4, ease: "power2.inOut" },
          "char2to3"
        )
        .to({}, { duration: 0.6 })
        // 3 → 4
        .to(
          char3Ref.current,
          { opacity: 0, duration: 0.4, ease: "power2.inOut" },
          "char3to4"
        )
        .to(
          char4Ref.current,
          { opacity: 1, duration: 0.4, ease: "power2.inOut" },
          "char3to4"
        )
        .to({}, { duration: 0.6 });

      // [ Scene 4 ] 마무리 이동 - 캐릭터를 아래로 내리면서 타이틀과 버튼 등장
      tl.to(
        characterImageRef.current,
        {
          top: "9.875rem", // 29.875rem → 9.875rem (아래로 내림)
          duration: 1.2,
          ease: "power3.inOut",
        },
        "finalMove"
      )
        .to(
          sectionRef.current,
          {
            top: "25rem", // 45rem → 25rem (함께 올라감)
            duration: 1.2,
            ease: "power3.inOut",
          },
          "finalMove" // 캐릭터와 동시에 시작
        )
        .to(
          titleFrameRef.current,
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
          },
          "finalMove+=0.2" // 이동 시작 후 0.2초 뒤 타이틀 등장
        )
        .fromTo(
          buttonFrameRef.current,
          {
            y: 200, // 더 아래에서 시작
            opacity: 0,
          },
          {
            y: 0, // 타이틀과 동일한 최종 위치
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
          },
          "finalMove+=0.8" // 타이틀 시작 후 0.6초 뒤 버튼 등장
        );
    });

    return () => ctx.revert();
  }, []);

  return {
    splashTitleRef,
    sectionRef,
    characterImageRef,
    titleFrameRef,
    buttonFrameRef,
    char1Ref,
    char2Ref,
    char3Ref,
    char4Ref,
  };
}
