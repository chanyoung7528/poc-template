"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { AuthActionButton } from "@/domains/auth/ui/AuthActionButton";
import styles from "./page.module.scss";

export default function AuthPage() {
  const router = useRouter();
  const [currentCharacter, setCurrentCharacter] = useState(1);

  // Scene refs
  const splashTitleRef = useRef<HTMLDivElement>(null);
  const characterWrapperRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLImageElement>(null);
  const bottomSectionRef = useRef<HTMLDivElement>(null);
  const titleFrameRef = useRef<HTMLDivElement>(null);
  const buttonFrameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 초기 상태 설정: titleFrame과 bottomSection을 화면 밖으로 숨김
      gsap.set([titleFrameRef.current, bottomSectionRef.current], {
        opacity: 0,
        y: "100vh",
      });

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
          bottomSectionRef.current,
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
          "crossMotion+=0.4" // bottomSection이 조금 올라온 후 fade-in
        );

      // [ Scene 3 ] 캐릭터 Frame Animation (1→2→3→4)
      // 캐릭터 이미지가 순차적으로 전환 (1초 간격)
      tl.call(() => setCurrentCharacter(1))
        .to({}, { duration: 1.0 })
        .call(() => setCurrentCharacter(2))
        .to({}, { duration: 1.0 })
        .call(() => setCurrentCharacter(3))
        .to({}, { duration: 1.0 })
        .call(() => setCurrentCharacter(4));

      // [ Scene 4 ] 마무리 이동 - 배경이 최종 위치로 확장, 버튼 등장
      tl.to(
        bottomSectionRef.current,
        {
          bottom: "-100px",
          height: "96dvh",
          duration: 0.8,
          ease: "power3.inOut",
        },
        "finalMove"
      )
        .to(
          titleFrameRef.current,
          {
            y: 120,
            duration: 0.8,
          },
          "finalMove+=0.3"
        )
        .fromTo(
          buttonFrameRef.current,
          {
            y: 0,
            opacity: 0,
          },
          {
            y: 120,
            opacity: 1,
            duration: 0.8,
          },
          "finalMove+=0.3"
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

  // 캐릭터 이미지 경로 (4개 이미지 순차 전환)
  const getCharacterImage = () => {
    return `/img/auth/chh-${currentCharacter}.png`;
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

      {/* 하단 영역 - 곡선 배경 + 캐릭터 + 타이틀 + 버튼 */}
      <div ref={bottomSectionRef} className={styles.curveSection}>
        {/* SVG 곡선 배경 - 위로 파인 곡선 (∪ 모양) */}
        <svg
          className={styles.curveSvg}
          viewBox="0 0 375 120"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M 0,80 Q 187.5,0 375,80 L 375,120 L 0,120 Z"
            fill="rgba(247, 245, 241, 1)"
          />
        </svg>

        {/* 캐릭터 이미지 - 곡선 위에 위치 */}
        <div ref={characterWrapperRef} className={styles.characterInCurve}>
          <img
            ref={characterRef}
            src={getCharacterImage()}
            alt="Wellness character"
            className={styles.characterImage}
            key={currentCharacter}
          />
        </div>

        {/* 타이틀과 버튼을 담는 컨텐츠 영역 */}
        <div className={styles.curveContent}>
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
      </div>
    </div>
  );
}
