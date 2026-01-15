"use client";

import { SignupTitle } from "@/domains/auth/ui/signup/SignupTitle";
import { SocialLoginButtons } from "@/domains/auth/ui/signup/button/SocialLoginButtons";
import styles from "./page.module.scss";
import { useRouter } from "next/navigation";
import { useLoginFlow } from "@/features/auth/hooks/useLoginFlow";

export default function SignupPage() {
  const { handleSocialLogin } = useLoginFlow();
  const router = useRouter();

  const handleWellnessId = () => {
    router.push("/terms-agreement");
  };

  return (
    <>
      <SignupTitle />
      <div className={styles.buttonContainer}>
        <SocialLoginButtons
          onWellnessId={handleWellnessId}
          onKakao={() => handleSocialLogin("kakao")}
          onNaver={() => handleSocialLogin("naver")}
          onApple={() => handleSocialLogin("apple")}
        />
      </div>
    </>
  );
}
