"use client";

import { AuthActionButton } from "@/domains/auth/ui/AuthActionButton";
import styles from "./page.module.scss";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();

  // Scene refs
  const splashTitleRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const titleFrameRef = useRef<HTMLDivElement>(null);
  const buttonFrameRef = useRef<HTMLDivElement>(null);

  // 캐릭터 이미지 refs (4개 모두 - 크로스 페이드용)
  const char1Ref = useRef<HTMLImageElement>(null);
  const char2Ref = useRef<HTMLImageElement>(null);
  const char3Ref = useRef<HTMLImageElement>(null);
  const char4Ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 초기 상태 설정: titleFrame과 section을 화면 밖으로 숨김
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
      // 동시에 하단 섹션(캐릭터 + 타이틀 포함)이 위로 올라옴
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
          titleFrameRef.current,
          {
            opacity: 1,
            duration: 0.6,
          },
          "crossMotion+=0.4" // section이 조금 올라온 후 fade-in
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

      // [ Scene 4 ] 마무리 이동 - 타이틀 이동 → 버튼 등장 (순차적)
      tl.to(
        titleFrameRef.current,
        {
          y: 0,
          duration: 0.8,
        },
        "finalMove"
      ).fromTo(
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
        "finalMove+=0.6" // 타이틀 시작 후 0.6초 뒤 버튼 등장
      );
    });

    return () => ctx.revert();
  }, []);

  const handleSignup = () => {
    router.push("/signup");
  };

  const handleLogin = () => {
    router.push("/login");
  };

  return (
    <div className={styles.container}>
      {/* 스플래쉬 타이틀 (Scene 1 & 2) - 이미지보다 위에 있다가 사라짐 */}
      <div ref={splashTitleRef} className={styles.splashTitle}>
        <h1 className={styles.splashMainTitle}>
          웰니스가 필요한 순간
          <br />
          언제 어디서나
        </h1>
        <p className={styles.splashSubTitle}>AI 웰니스 솔루션</p>
      </div>

      {/* 캐릭터 이미지 - 곡선 위에 위치 (4개 모두 렌더, opacity로 크로스 페이드) */}
      <div className={styles.characterImage}>
        <img
          ref={char1Ref}
          src="/img/auth/ch-1.png"
          alt="Wellness character 1"
          style={{ position: "absolute", width: "100%", height: "auto" }}
        />
        <img
          ref={char2Ref}
          src="/img/auth/ch-2.png"
          alt="Wellness character 2"
          style={{ position: "absolute", width: "100%", height: "auto" }}
        />
        <img
          ref={char3Ref}
          src="/img/auth/ch-3.png"
          alt="Wellness character 3"
          style={{ position: "absolute", width: "100%", height: "auto" }}
        />
        <img
          ref={char4Ref}
          src="/img/auth/ch-4.png"
          alt="Wellness character 4"
          style={{ position: "absolute", width: "100%", height: "auto" }}
        />
      </div>

      {/* 하단 섹션 - 곡선 배경 + 타이틀 + 버튼 */}
      <section ref={sectionRef} className={styles.section}>
        {/* SVG 곡선 배경 - 위로 파인 곡선 (∪ 모양) */}
        <svg
          className={styles.curveMask}
          viewBox="0 0 360 80"
          preserveAspectRatio="none"
        >
          <defs>
            <mask id="curveMask">
              <rect width="100%" height="100%" fill="white" />
              <path d="M0,0 L0,40 Q180,80 360,40 L360,0 Z" fill="black" />
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="#F7F3ED"
            mask="url(#curveMask)"
          />
        </svg>

        <div className={styles.content}>
          {/* Wellness 타이틀 - 캐릭터와 함께 등장 */}
          <div ref={titleFrameRef} className={styles.titleFrame}>
            <h2 className={styles.wellnessTitle}>wellness</h2>
            <p className={styles.wellnessSubtitle}>
              바쁜 일상 속, 나를 챙기는 순간
            </p>
          </div>

          {/* 액션 버튼들 (Scene 4) */}
          <div ref={buttonFrameRef} className={styles.buttonFrame}>
            <AuthActionButton
              className={styles.button}
              icon={
                <img
                  src="/img/auth/giftbox.png"
                  alt=""
                  width={40}
                  height={40}
                />
              }
              label="처음 방문하셨나요?"
              title="신규회원 가입하기"
              onClick={handleSignup}
            />
            <AuthActionButton
              className={styles.button}
              icon={
                <img
                  src="/img/auth/auth-star.png"
                  alt=""
                  width={60}
                  height={60}
                />
              }
              label="이미 회원이신가요?"
              title="지금 로그인하기"
              onClick={handleLogin}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
