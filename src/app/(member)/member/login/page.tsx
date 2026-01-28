/**
 * Page: Member - Login
 * 
 * 역할: 로그인 페이지
 */

"use client";

import { GeneralLoginFlow } from "@/features/member/ui";
import { useRouter } from "next/navigation";
import styles from "./page.module.scss";

export default function MemberLoginPage() {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <GeneralLoginFlow
        onNavigateToSignup={() => router.push("/member/signup")}
        onNavigateToForgotPassword={() => router.push("/member/reset-password")}
      />
    </div>
  );
}
