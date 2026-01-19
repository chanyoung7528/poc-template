"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/shared/ui/Button";
import styles from "./page.module.scss";
import Image from "next/image";
import { gsap } from "gsap";

function SignupCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const wellnessId = searchParams.get("wellnessId") || "welless04";

  // Refs for animations
  const containerRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const benefitsRef = useRef<HTMLParagraphElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const confettiRefs = useRef<(HTMLImageElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Timeline for sequential animations
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
      });

      // 1. Fade in container
      tl.fromTo(
        containerRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2 }
      );

      // 2. Character bounces in with scale - 한 번만 실행
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
        "+=0.05"
      );

      // 3. Confetti 빵빠레 효과 - 캐릭터 주변에서 돌며 퍼짐
      confettiRefs.current.forEach((confetti, index) => {
        if (!confetti) return;

        // 컨페티가 퍼지는 각도와 거리 - 캐릭터 주변에 가깝게
        const angle = Math.random() * Math.PI * 2;
        const distance = 40 + Math.random() * 30; // 거리 줄임 (40~70px)

        // 최종 위치
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
            rotation: Math.random() * 360 - 180, // 1회전
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          "-=0.3"
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

      // 4. Title slides in from bottom - 컨페티와 동시에
      tl.fromTo(
        titleRef.current,
        {
          y: 30,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.3,
        },
        "<" // 이전 애니메이션과 동시에 시작
      );

      // 5. Subtitle fades in - 더 빨리
      tl.fromTo(
        subtitleRef.current,
        {
          y: 20,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.3,
        },
        "-=0.15"
      );

      // 6. Benefits message - 더 빨리
      tl.fromTo(
        benefitsRef.current,
        {
          scale: 0.9,
          opacity: 0,
        },
        {
          scale: 1,
          opacity: 1,
          duration: 0.3,
        },
        "-=0.05"
      );

      // 7. Action buttons slide up - 더 빨리
      tl.fromTo(
        actionsRef.current,
        {
          y: 30,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.3,
          ease: "back.out(1.2)",
        },
        "-=0.05"
      );

      // 캐릭터는 초기 애니메이션 후 정적으로 유지 (반복 애니메이션 제거)
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleGroupMatching = () => {
    // Button press animation
    if (actionsRef.current?.children[0]) {
      gsap.to(actionsRef.current.children[0], {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          router.push("/main");
        },
      });
    } else {
      router.push("/main");
    }
  };

  const handleSkip = () => {
    // Button press animation
    if (actionsRef.current?.children[1]) {
      gsap.to(actionsRef.current.children[1], {
        scale: 0.95,
        duration: 0.1,
        yoyo: true,
        repeat: 1,
        onComplete: () => {
          router.push("/main");
        },
      });
    } else {
      router.push("/main");
    }
  };

  return (
    <div ref={containerRef} className={styles.container}>
      <div className={styles.content}>
        {/* Confetti Decorations */}
        <div className={styles.confettiWrapper}>
          <Image
            ref={(el) => {
              confettiRefs.current[0] = el;
            }}
            src="/img/auth/confetti1.svg"
            alt=""
            width={22}
            height={18}
            className={`${styles.confetti} ${styles.confetti1}`}
          />
          <Image
            ref={(el) => {
              confettiRefs.current[1] = el;
            }}
            src="/img/auth/confetti2.svg"
            alt=""
            width={16}
            height={15}
            className={`${styles.confetti} ${styles.confetti2}`}
          />
          <Image
            ref={(el) => {
              confettiRefs.current[2] = el;
            }}
            src="/img/auth/confetti3.svg"
            alt=""
            width={20}
            height={18}
            className={`${styles.confetti} ${styles.confetti3}`}
          />
          <Image
            ref={(el) => {
              confettiRefs.current[3] = el;
            }}
            src="/img/auth/confetti4.svg"
            alt=""
            width={22}
            height={19}
            className={`${styles.confetti} ${styles.confetti4}`}
          />
          <Image
            ref={(el) => {
              confettiRefs.current[4] = el;
            }}
            src="/img/auth/confetti5.svg"
            alt=""
            width={19}
            height={17}
            className={`${styles.confetti} ${styles.confetti5}`}
          />
          <Image
            ref={(el) => {
              confettiRefs.current[5] = el;
            }}
            src="/img/auth/confetti6.svg"
            alt=""
            width={15}
            height={19}
            className={`${styles.confetti} ${styles.confetti6}`}
          />
          <Image
            ref={(el) => {
              confettiRefs.current[6] = el;
            }}
            src="/img/auth/confetti7.svg"
            alt=""
            width={13}
            height={11}
            className={`${styles.confetti} ${styles.confetti7}`}
          />
        </div>

        {/* Character Image */}
        <div ref={characterRef} className={styles.characterWrapper}>
          <div className={styles.characterCircle} />
          <Image
            src="/img/auth/welcome3.png"
            alt="환영 캐릭터"
            width={186}
            height={282}
            className={styles.characterImage}
            priority
          />
        </div>

        {/* Title Section */}
        <div ref={titleRef} className={styles.titleSection}>
          <h1 className={styles.title}>
            <span className={styles.userId}>{wellnessId}</span>님
            <br />
            회원가입을 완료했어요!
          </h1>
          <p ref={subtitleRef} className={styles.subtitle}>
            가입하신 정보로 소속된 그룹이 있는지
            <br />
            한번 확인해볼까요?
          </p>
        </div>

        {/* Benefits Message */}
        <p ref={benefitsRef} className={styles.benefitsMessage}>
          그룹이 있다면 추가 혜택도 함께
          <br />
          이용하실 수 있어요
        </p>

        {/* Action Buttons */}
        <div ref={actionsRef} className={styles.actions}>
          <Button
            onClick={handleGroupMatching}
            fullWidth
            className={styles.primaryButton}
          >
            소속 그룹 매칭하기
          </Button>
          <button onClick={handleSkip} className={styles.skipButton}>
            건너뛰기
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SignupCompletePage() {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <div className={styles.content}>
            <p>로딩 중...</p>
          </div>
        </div>
      }
    >
      <SignupCompleteContent />
    </Suspense>
  );
}
