"use client";

import { FormInput } from "@/domains/auth/ui/common/FormInput";
import { WellnessIdInput } from "@/domains/auth/ui/input/WellnessIdInput";
import { checkWellnessIdDuplicate } from "@/domains/auth/model/auth.api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import styles from "./page.module.scss";
import { useVerifyCertification } from "@/domains/auth/model/auth.queries";

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

function CredentialsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [hasProcessed, setHasProcessed] = useState(false); // 처리 완료 플래그
  const verifyCertificationMutation = useVerifyCertification();

  const { control, handleSubmit } = useForm<AccountForm>({
    resolver: zodResolver(accountSchema),
    mode: "onChange",
    defaultValues: {
      wellnessId: "",
      password: "",
      passwordConfirm: "",
    },
  });

  // 본인인증 리다이렉트 결과 처리 + 세션 확인
  useEffect(() => {
    // 이미 처리했으면 무시
    if (hasProcessed) {
      console.log("ℹ️ 이미 처리 완료됨, 스킵");
      return;
    }

    const processAuthentication = async () => {
      try {
        // 1. URL 파라미터로 본인인증 결과가 있는지 확인
        const impUid = searchParams.get("imp_uid");
        const impSuccess =
          searchParams.get("imp_success") || searchParams.get("success");
        const errorMsg = searchParams.get("error_msg");

        console.log("📱 URL 파라미터 확인:", {
          imp_uid: impUid,
          imp_success: impSuccess,
          error_msg: errorMsg,
        });

        let verificationCompleted = false;

        // 2. 본인인증 결과가 있으면 서버로 전송
        if (impUid && impSuccess === "true") {
          console.log("✅ 본인인증 성공, 서버 검증 시작...");
          setHasProcessed(true); // 처리 시작 플래그 설정

          // 서버에 본인인증 결과 전송 (mutation 사용)
          verifyCertificationMutation.mutate(impUid, {
            onSuccess: async (certResult) => {
              console.log("✅ 서버 검증 완료:", certResult);

              // 이미 가입된 사용자이거나 14세 미만인 경우 처리
              if (certResult.status === "EXISTING") {
                router.push(
                  `/auth/result?maskedId=${certResult.user?.maskedId}&provider=${certResult.user?.provider}`
                );
                return;
              }

              if (certResult.status === "UNDER_14") {
                router.push("/auth/guide/minor");
                return;
              }

              // 3. 본인인증 완료 처리
              try {
                const completeResponse = await fetch(
                  "/api/auth/verify-complete",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      verificationData: certResult.certificationData,
                    }),
                  }
                );

                if (!completeResponse.ok) {
                  const completeData = await completeResponse.json();
                  console.error(
                    "본인인증 세션 업데이트 실패:",
                    completeData.error
                  );

                  if (completeData.error === "terms_required") {
                    alert("약관 동의가 필요합니다.");
                    router.push("/terms-agreement");
                  } else {
                    alert("본인인증 처리 중 오류가 발생했습니다.");
                    router.push("/verify");
                  }
                  return;
                }

                console.log("✅ 본인인증 완료, 회원가입 페이지 준비됨");

                // URL에서 인증 파라미터 제거
                window.history.replaceState({}, "", "/signup/credentials");

                // 폼 표시
                setIsVerifying(false);
              } catch (error) {
                console.error("본인인증 완료 처리 중 오류:", error);
                alert("본인인증 처리 중 오류가 발생했습니다.");
                router.push("/verify");
              }
            },
            onError: (error) => {
              console.error("본인인증 검증 실패:", error);
              alert("본인인증 검증에 실패했습니다. 다시 시도해주세요.");
              router.push("/verify");
            },
          });

          return; // mutation 콜백에서 처리하므로 여기서 종료
        }

        // 5. 파라미터 없이 직접 접근한 경우 세션 확인
        console.log("ℹ️ 직접 접근 - 세션 확인");
        const response = await fetch("/api/auth/session");
        const data = await response.json();

        if (!response.ok || !data.user) {
          router.push("/signup?error=session_expired");
          return;
        }

        // 일반 회원가입이 아니거나 본인인증이 완료되지 않은 경우
        if (data.user.signupType !== "wellness" || !data.user.verified) {
          console.log("⚠️ 본인인증 미완료, /verify로 리다이렉트");
          router.push("/verify");
          return;
        }

        console.log("✅ 세션 확인 완료, 폼 표시");
        setIsVerifying(false);
      } catch (error) {
        console.error("인증 처리 중 오류:", error);
        alert("인증 처리 중 오류가 발생했습니다.");
        router.push("/verify");
      }
    };

    processAuthentication();
  }, [router, searchParams, hasProcessed, verifyCertificationMutation]);

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
      console.log("📝 웰니스 회원가입 요청 시작");

      // 세션 상태 확인을 위한 API 호출
      const sessionCheck = await fetch("/api/auth/session");
      const sessionData = await sessionCheck.json();

      console.log("🔍 현재 세션 상태:", sessionData);

      if (!sessionData.user) {
        console.error("❌ 세션이 없습니다. 회원가입 페이지로 이동");
        alert("세션이 만료되었습니다. 처음부터 다시 시도해주세요.");
        router.push("/signup");
        return;
      }

      if (sessionData.user.signupType !== "wellness") {
        console.error(
          "❌ 일반 회원가입 세션이 아닙니다:",
          sessionData.user.signupType
        );
        alert("잘못된 회원가입 경로입니다. 처음부터 다시 시도해주세요.");
        router.push("/signup");
        return;
      }

      console.log("✅ 세션 확인 완료, 회원가입 API 호출");

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
        } else if (result.error === "invalid_signup_type") {
          alert("잘못된 회원가입 경로입니다. 처음부터 다시 시도해주세요.");
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
        {isVerifying ? (
          <div className={styles.loadingOverlay}>
            <p>본인인증 처리 중...</p>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}

export default function CredentialsPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <div className={styles.content}>
            <div className={styles.loadingOverlay}>
              <p>로딩 중...</p>
            </div>
          </div>
        </div>
      }
    >
      <CredentialsPageContent />
    </Suspense>
  );
}
