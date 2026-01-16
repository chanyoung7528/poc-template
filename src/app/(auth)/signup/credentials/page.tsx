"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FormInput } from "@/domains/auth/ui/common/FormInput";
import { Button } from "@/shared/ui/Button";
import styles from "./page.module.scss";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface AccountForm {
  wellnessId: string;
  password: string;
  passwordConfirm: string;
}

const accountSchema = z
  .object({
    wellnessId: z
      .string()
      .min(4, "아이디는 4자 이상이어야 합니다")
      .regex(/^[a-z0-9_]+$/, "영문 소문자, 숫자, _만 입력 가능합니다"),
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

  const { control, handleSubmit, watch } = useForm<AccountForm>({
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

      // 성공 메시지 표시 후 메인 페이지로 이동
      alert("회원가입이 완료되었습니다!");
      router.push("/main");
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
          사용하실 아이디와 패스워드를 입력해 주세요
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.section}>
            <FormInput
              name="wellnessId"
              control={control}
              label="아이디"
              type="text"
              placeholder="4자 이상 (영문, 숫자, _)"
              onChange={(value) => {
                const sanitized = value
                  .toLowerCase()
                  .replace(/[^a-z0-9_]/g, "");
                if (value !== sanitized) {
                  return;
                }
              }}
              autoFocus
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

            <Button
              type="submit"
              variant="primary"
              size="large"
              disabled={isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? "처리 중..." : "회원가입 완료"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
