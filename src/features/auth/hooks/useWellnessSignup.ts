import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkWellnessIdDuplicate } from "@/domains/auth/model/auth.api";
import type { AccountForm } from "@/domains/auth/ui/signup/CredentialsForm";

interface UseWellnessSignupReturn {
  isSubmitting: boolean;
  handleSubmit: (data: AccountForm) => Promise<void>;
  handleDuplicateCheck: (wellnessId: string) => Promise<boolean>;
}

export function useWellnessSignup(): UseWellnessSignupReturn {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateSession = async () => {
    const response = await fetch("/api/auth/session");
    const sessionData = await response.json();

    console.log("🔍 현재 세션 상태:", sessionData);

    if (!sessionData.user) {
      console.error("❌ 세션이 없습니다.");
      alert("세션이 만료되었습니다. 처음부터 다시 시도해주세요.");
      router.push("/signup");
      return false;
    }

    if (sessionData.user.signupType !== "wellness") {
      console.error("❌ 일반 회원가입 세션이 아닙니다:", sessionData.user.signupType);
      alert("잘못된 회원가입 경로입니다. 처음부터 다시 시도해주세요.");
      router.push("/signup");
      return false;
    }

    return true;
  };

  const handleSubmit = async (data: AccountForm) => {
    setIsSubmitting(true);

    try {
      console.log("📝 웰니스 회원가입 요청 시작");

      // 세션 검증
      const isValid = await validateSession();
      if (!isValid) return;

      console.log("✅ 세션 확인 완료, 회원가입 API 호출");

      // 회원가입 API 호출
      const response = await fetch("/api/auth/wellness/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wellnessId: data.wellnessId,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        handleSignupError(result.error);
        return;
      }

      console.log("✅ 회원가입 성공");
      router.push(`/signup/complete?wellnessId=${encodeURIComponent(data.wellnessId)}`);
    } catch (error) {
      console.error("회원가입 요청 중 오류:", error);
      alert("네트워크 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignupError = (error: string) => {
    const errorMessages: Record<string, string> = {
      duplicate_id: "이미 사용 중인 아이디입니다.",
      unauthorized: "세션이 만료되었습니다. 처음부터 다시 시도해주세요.",
      invalid_signup_type: "잘못된 회원가입 경로입니다. 처음부터 다시 시도해주세요.",
    };

    const message = errorMessages[error] || "회원가입 중 오류가 발생했습니다. 다시 시도해주세요.";
    alert(message);

    if (error === "unauthorized" || error === "invalid_signup_type") {
      router.push("/signup");
    }
  };

  const handleDuplicateCheck = async (wellnessId: string): Promise<boolean> => {
    try {
      return await checkWellnessIdDuplicate(wellnessId);
    } catch (error) {
      console.error("중복 확인 중 오류:", error);
      return true; // 에러 시 중복으로 처리
    }
  };

  return {
    isSubmitting,
    handleSubmit,
    handleDuplicateCheck,
  };
}

