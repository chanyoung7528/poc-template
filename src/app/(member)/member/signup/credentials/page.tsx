/**
 * Page: Member - 회원가입 정보 입력
 * 
 * 역할: 아이디/비밀번호/닉네임 입력 페이지
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGeneralSignupFlow } from "@/features/member/hooks";
import { useMemberStore } from "@/domains/member/model";
import { CredentialsForm } from "@/domains/auth/ui/signup/CredentialsForm";
import { toast } from "sonner";
import styles from "./page.module.scss";

export default function MemberSignupCredentialsPage() {
  const router = useRouter();
  const verificationToken = useMemberStore((state) => state.verificationToken);
  const { handleRegister, isRegistering } = useGeneralSignupFlow();

  // verificationToken이 없으면 본인인증으로
  if (!verificationToken) {
    router.push("/member/verify");
    return null;
  }

  const handleSubmit = async (data: {
    wellnessId: string;
    password: string;
    passwordConfirm: string;
  }) => {
    await handleRegister({
      wellnessId: data.wellnessId,
      password: data.password,
      nickname: data.wellnessId, // 닉네임은 아이디로 기본 설정
      agreeMarketing: false,
    });
  };

  const handleDuplicateCheck = async (wellnessId: string) => {
    // TODO: 중복 체크 API 호출
    console.log("중복 체크:", wellnessId);
    return true; // 사용 가능
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>회원 정보 입력</h1>
        <p className={styles.subtitle}>거의 다 왔습니다!</p>

        <CredentialsForm
          onSubmit={handleSubmit}
          isSubmitting={isRegistering}
          onDuplicateCheck={handleDuplicateCheck}
        />
      </div>
    </div>
  );
}
