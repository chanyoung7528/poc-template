/**
 * Page: Member - 회원가입 완료
 * 
 * 역할: 회원가입 완료 축하 페이지
 */

"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useMemberStore } from "@/domains/member/model";
import styles from "./page.module.scss";
import SucessCheckLottie from "@/shared/ui/lottie/SucessCheckLottie";
import { gsap } from "gsap";

export default function MemberSignupCompletePage() {
  const router = useRouter();
  const member = useMemberStore((state) => state.member);

  const confettiRef = useRef<HTMLDivElement>(null);
  const characterRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 간단한 페이드인 애니메이션
  useEffect(() => {
    if (!characterRef.current || !titleRef.current) return;

    const tl = gsap.timeline();

    tl.from(characterRef.current, {
      scale: 0,
      duration: 0.5,
      ease: "back.out",
    })
      .from(
        titleRef.current,
        {
          opacity: 0,
          y: 20,
          duration: 0.5,
        },
        "-=0.2"
      )
      .from(
        messageRef.current,
        {
          opacity: 0,
          y: 20,
          duration: 0.5,
        },
        "-=0.2"
      )
      .from(
        buttonRef.current,
        {
          opacity: 0,
          y: 20,
          duration: 0.5,
        },
        "-=0.2"
      );
  }, []);

  useEffect(() => {
    // 회원 정보가 없으면 메인으로
    if (!member) {
      router.push("/member");
    }
  }, [member, router]);

  const handleStart = () => {
    router.push("/main");
  };

  if (!member) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Confetti Background */}
      <div ref={confettiRef} className={styles.confetti}>
        {[...Array(50)].map((_, i) => (
          <div key={i} className={styles.confettiPiece} />
        ))}
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {/* Success Animation */}
        <div ref={characterRef} className={styles.character}>
          <SucessCheckLottie />
        </div>

        {/* Welcome Message */}
        <h1 ref={titleRef} className={styles.title}>
          회원가입 완료!
        </h1>

        <p ref={messageRef} className={styles.message}>
          <strong>{member.nickname}</strong>님,
          <br />
          웰니스에 오신 것을 환영합니다!
        </p>

        {/* Start Button */}
        <button
          ref={buttonRef}
          className={styles.startButton}
          onClick={handleStart}
        >
          시작하기
        </button>
      </div>
    </div>
  );
}
