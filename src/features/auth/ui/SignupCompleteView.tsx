import Image from "next/image";
import { Button } from "@/shared/ui/Button";
import { OnBoardingGroupView } from "@/domains/onboarding/ui/OnBoardingGroupView";
import { useGroupPageAnimation } from "@/domains/onboarding/hooks/useGroupPageAnimation";
import styles from "./SignupCompleteView.module.scss";

interface SignupCompleteViewProps {
  wellnessId: string;
  isMatching: boolean;
  onStartMatching: () => void;
  onSkip: () => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  characterRef: React.RefObject<HTMLDivElement | null>;
  titleRef: React.RefObject<HTMLDivElement | null>;
  subtitleRef: React.RefObject<HTMLParagraphElement | null>;
  benefitsRef: React.RefObject<HTMLParagraphElement | null>;
  actionsRef: React.RefObject<HTMLDivElement | null>;
  confettiRefs: React.MutableRefObject<(HTMLImageElement | null)[]>;
}

export function SignupCompleteView({
  wellnessId,
  isMatching,
  onStartMatching,
  onSkip,
  containerRef,
  characterRef,
  titleRef,
  subtitleRef,
  benefitsRef,
  actionsRef,
  confettiRefs,
}: SignupCompleteViewProps) {
  const { footerRef, skipButtonRef, matchingContentRef, searchImageRef } =
    useGroupPageAnimation({ isMatching });

  const buttonText = isMatching ? "매칭 중입니다..." : "소속 그룹 매칭하기";

  return (
    <div ref={containerRef} className={styles.container}>
      {isMatching ? (
        <div ref={matchingContentRef} className={styles.matchingContent}>
          <OnBoardingGroupView searchImageRef={searchImageRef} />
        </div>
      ) : (
        <div className={styles.content}>
          {/* Confetti Decorations */}
          <div className={styles.confettiWrapper}>
            {[1, 2, 3, 4, 5, 6, 7].map((num) => (
              <Image
                key={num}
                ref={(el) => {
                  confettiRefs.current[num - 1] = el;
                }}
                src={`/img/auth/confetti${num}.svg`}
                alt=""
                width={num % 2 === 0 ? 16 : 22}
                height={num % 2 === 0 ? 15 : 18}
                className={`${styles.confetti} ${styles[`confetti${num}`]}`}
              />
            ))}
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
        </div>
      )}

      {/* Footer with Actions */}
      <footer ref={footerRef} className={styles.footer}>
        <div ref={actionsRef} className={styles.buttonGroup}>
          <Button
            variant="default"
            size="full"
            onClick={onStartMatching}
            disabled={isMatching}
          >
            {buttonText}
          </Button>
          <button
            ref={skipButtonRef}
            onClick={onSkip}
            className={styles.skipButton}
          >
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
      </footer>
    </div>
  );
}

