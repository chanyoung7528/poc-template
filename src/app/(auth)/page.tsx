"use client";

import {
  AuthActionButton,
  AuthContainer,
  AuthCurveMask,
} from "@/domains/auth/ui";
import styles from "./page.module.scss";
import { useRouter } from "next/navigation";
import { useAuthAnimation } from "@/features/auth/hooks/useAuthAnimation";
import { useEffect } from "react";

export default function AuthPage() {
  const router = useRouter();

  // 페이지 접근 시 세션 초기화
  useEffect(() => {
    const clearSession = async () => {
      try {
        console.log("🔄 메인 auth 페이지 접근 - 세션 초기화");
        await fetch("/api/auth/logout", {
          method: "POST",
        });
        console.log("✅ 세션 초기화 완료");
      } catch (error) {
        console.error("❌ 세션 초기화 실패:", error);
      }
    };

    clearSession();
  }, []);

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
    <AuthContainer>
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
          className={styles.image}
        />
        <img
          ref={char2Ref}
          src="/img/auth/ch-2.png"
          alt="Wellness character 2"
          className={styles.image}
        />
        <img
          ref={char3Ref}
          src="/img/auth/ch-3.png"
          alt="Wellness character 3"
          className={styles.image}
        />
        <img
          ref={char4Ref}
          src="/img/auth/ch-4.png"
          alt="Wellness character 4"
          className={styles.image}
        />
      </div>

      {/* 하단 섹션 - 곡선 배경 + 타이틀 + 버튼 */}
      <section ref={sectionRef} className={styles.section}>
        <AuthCurveMask />

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
    </AuthContainer>
  );
}
