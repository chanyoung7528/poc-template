"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FormInput } from "@/domains/auth/ui/common/FormInput";
import { Button } from "@/shared/ui/Button";
import styles from "./page.module.scss";

interface CredentialsForm {
  wellnessId: string;
  password: string;
  passwordConfirm: string;
}

export default function CredentialsPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CredentialsForm>({
    mode: "onChange",
    defaultValues: {
      wellnessId: "",
      password: "",
      passwordConfirm: "",
    },
  });

  // 본인인증 완료 및 중복 검증
  useEffect(() => {
    const checkDuplicate = async () => {
      try {
        const response = await fetch("/api/auth/wellness/check-duplicate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.error === "unauthorized") {
            router.push("/signup?error=session_expired");
          } else if (data.error === "verification_required") {
            router.push("/verify");
          }
          return;
        }

        // 중복 회원 체크
        if (data.isDuplicate) {
          console.log("⚠️ 이미 가입된 회원");
          router.push("/duplicate-account");
        }
      } catch (error) {
        console.error("중복 검증 중 오류:", error);
        alert("오류가 발생했습니다. 다시 시도해주세요.");
      }
    };

    checkDuplicate();
  }, [router]);

  const password = watch("password");

  const onSubmit = async (data: CredentialsForm) => {
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
        <h1 className={styles.title}>아이디·비밀번호 설정</h1>
        <p className={styles.subtitle}>
          로그인에 사용할 아이디와 비밀번호를 입력해주세요
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <FormInput
            name="wellnessId"
            control={control}
            label="아이디"
            placeholder="영문, 숫자 조합 6-20자"
            rules={{
              required: "아이디를 입력해주세요",
              pattern: {
                value: /^[a-zA-Z0-9]{6,20}$/,
                message: "영문, 숫자 조합 6-20자로 입력해주세요",
              },
            }}
            error={errors.wellnessId?.message}
          />

          <FormInput
            name="password"
            control={control}
            label="비밀번호"
            type="password"
            placeholder="영문, 숫자, 특수문자 조합 8-20자"
            rules={{
              required: "비밀번호를 입력해주세요",
              pattern: {
                value:
                  /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,20}$/,
                message: "영문, 숫자, 특수문자 조합 8-20자로 입력해주세요",
              },
            }}
            error={errors.password?.message}
          />

          <FormInput
            name="passwordConfirm"
            control={control}
            label="비밀번호 확인"
            type="password"
            placeholder="비밀번호를 다시 입력해주세요"
            rules={{
              required: "비밀번호 확인을 입력해주세요",
              validate: (value) =>
                value === password || "비밀번호가 일치하지 않습니다",
            }}
            error={errors.passwordConfirm?.message}
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
        </form>
      </div>
    </div>
  );
}
