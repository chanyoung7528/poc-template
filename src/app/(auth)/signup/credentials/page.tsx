"use client";

import { FormInput } from "@/domains/auth/ui/common/FormInput";
import { WellnessIdInput } from "@/domains/auth/ui/input/WellnessIdInput";
import { checkWellnessIdDuplicate } from "@/domains/auth/model/auth.api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import styles from "./page.module.scss";

interface AccountForm {
  wellnessId: string;
  password: string;
  passwordConfirm: string;
}

const accountSchema = z
  .object({
    wellnessId: z
      .string()
      .min(10, "")
      .max(15, "")
      .regex(/^[a-z0-9]+$/, "")
      .regex(/[a-z]/, "")
      .regex(/\d/, ""),
    password: z
      .string()
      .min(8, "비밀번호는 8자 이상이어야 합니다")
      .regex(/^(?=.*[a-zA-Z])(?=.*[0-9])/, "영문과 숫자를 포함해야 합니다"),
    passwordConfirm: z.string().min(1, "비밀번호 확인을 입력해주세요"),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["passwordConfirm"],
  });

export default function CredentialsPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<AccountForm>({
    resolver: zodResolver(accountSchema),
    mode: "onChange",
    defaultValues: {
      wellnessId: "",
      password: "",
      passwordConfirm: "",
    },
  });

  // 세션 확인 (서버에서 이미 중복 확인 완료 후 리다이렉트됨)
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch("/api/auth/session");
        const data = await response.json();

        if (!response.ok || !data.user) {
          router.push("/signup?error=session_expired");
          return;
        }

        // 일반 회원가입이 아니거나 본인인증이 완료되지 않은 경우
        if (data.user.signupType !== "wellness" || !data.user.verified) {
          router.push("/verify");
          return;
        }
      } catch (error) {
        console.error("세션 확인 중 오류:", error);
        router.push("/signup?error=session_expired");
      }
    };

    checkSession();
  }, [router]);

  // 중복 확인 함수
  const handleDuplicateCheck = async (wellnessId: string): Promise<boolean> => {
    try {
      return await checkWellnessIdDuplicate(wellnessId);
    } catch (error) {
      console.error("중복 확인 중 오류:", error);
      // 에러 발생 시 중복으로 처리하여 사용 불가능하게 함
      return true;
    }
  };

  const onSubmit = async (data: AccountForm) => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/wellness/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wellnessId: data.wellnessId,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("회원가입 실패:", result.error);

        if (result.error === "duplicate_id") {
          alert("이미 사용 중인 아이디입니다.");
        } else if (result.error === "unauthorized") {
          alert("세션이 만료되었습니다. 처음부터 다시 시도해주세요.");
          router.push("/signup");
        } else {
          alert("회원가입 중 오류가 발생했습니다. 다시 시도해주세요.");
        }
        return;
      }

      console.log("✅ 회원가입 성공");

      // 회원가입 완료 페이지로 이동 (wellnessId 전달)
      router.push(
        `/signup/complete?wellnessId=${encodeURIComponent(data.wellnessId)}`
      );
    } catch (error) {
      console.error("회원가입 요청 중 오류:", error);
      alert("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <h1 className={styles.title}>
          사용하실 아이디와{"\n"}패스워드를 입력해 주세요
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.section}>
            <WellnessIdInput
              name="wellnessId"
              control={control}
              label="아이디"
              placeholder="아이디를 입력해주세요"
              onDuplicateCheck={handleDuplicateCheck}
            />

            <FormInput
              name="password"
              control={control}
              label="비밀번호"
              type="password"
              placeholder="영문, 숫자, 특수문자 조합 8-20자"
            />

            <FormInput
              name="passwordConfirm"
              control={control}
              label="비밀번호 확인"
              type="password"
              placeholder="비밀번호를 다시 입력해주세요"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitButton}
          >
            {isSubmitting ? "처리 중..." : "회원가입 완료"}
          </button>
        </form>
      </div>
    </div>
  );
}
