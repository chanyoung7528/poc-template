import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { FormInput } from "@/domains/auth/ui/common/FormInput";
import { WellnessIdInput } from "@/domains/auth/ui/input/WellnessIdInput";
import styles from "./CredentialsForm.module.scss";

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

interface CredentialsFormProps {
  isSubmitting: boolean;
  onSubmit: (data: AccountForm) => Promise<void>;
  onDuplicateCheck: (wellnessId: string) => Promise<boolean>;
}

export function CredentialsForm({
  isSubmitting,
  onSubmit,
  onDuplicateCheck,
}: CredentialsFormProps) {
  const { control, handleSubmit } = useForm<AccountForm>({
    resolver: zodResolver(accountSchema),
    mode: "onChange",
    defaultValues: {
      wellnessId: "",
      password: "",
      passwordConfirm: "",
    },
  });

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
              onDuplicateCheck={onDuplicateCheck}
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

export type { AccountForm };
