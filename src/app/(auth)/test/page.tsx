"use client";

import { AuthActionButton } from "@/domains/auth/ui/AuthActionButton";
import styles from "./page.module.scss";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";

const CurveMask = () => {
  return (
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
      <rect width="100%" height="100%" fill="#F7F3ED" mask="url(#curveMask)" />
    </svg>
  );
};

const CharacterImage = () => {
  return (
    <div className={styles.characterImage}>
      <img src="/img/auth/ch-1.png" alt="Character" />
      <img src="/img/auth/ch-2.png" alt="Character" />
      <img src="/img/auth/ch-3.png" alt="Character" />
      <img src="/img/auth/ch-4.png" alt="Character" />
    </div>
  );
};

export default function AuthPage() {
  // Scene refs
  const splashTitleRef = useRef<HTMLDivElement>(null);
  const characterWrapperRef = useRef<HTMLDivElement>(null);
  const bottomSectionRef = useRef<HTMLDivElement>(null);
  const titleFrameRef = useRef<HTMLDivElement>(null);
  const buttonFrameRef = useRef<HTMLDivElement>(null);

  // 캐릭터 이미지 refs (4개 모두 - 크로스 페이드용)
  const char1Ref = useRef<HTMLImageElement>(null);
  const char2Ref = useRef<HTMLImageElement>(null);
  const char3Ref = useRef<HTMLImageElement>(null);
  const char4Ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".characterImage", {
        opacity: 1,
        duration: 1,
      });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.splashTitle}>
        <h1 className={styles.splashMainTitle}>
          웰니스가 필요한 순간
          <br />
          언제 어디서나
        </h1>
        <p className={styles.splashSubTitle}>AI 웰니스 솔루션</p>
      </div>

      <CharacterImage />

      <section className={styles.section}>
        <CurveMask />

        <div className={styles.content}>
          <div className={styles.titleFrame}>
            <h2 className={styles.wellnessTitle}>wellness</h2>
            <p className={styles.wellnessSubtitle}>
              바쁜 일상 속, 나를 챙기는 순간
            </p>
          </div>
          <div className={styles.buttonFrame}>
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
            />
          </div>
        </div>
      </section>
    </div>
  );
}
