"use client";

import { AuthActionButton } from "@/domains/auth/ui/AuthActionButton";
import styles from "./page.module.scss";
import { useRouter } from "next/navigation";
import { useAuthAnimation } from "@/features/auth/hooks/useAuthAnimation";

export default function AuthPage() {
  const router = useRouter();

  // 커스텀 훅으로 애니메이션 로직 분리
  const {
    splashTitleRef,
    sectionRef,
    characterImageRef,
    titleFrameRef,
    buttonFrameRef,
    char1Ref,
    char2Ref,
    char3Ref,
    char4Ref,
  } = useAuthAnimation();

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
      <div ref={characterImageRef} className={styles.characterImage}>
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
