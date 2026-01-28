/**
 * Feature: Member - 일반 로그인 플로우
 * 
 * 역할: 일반 로그인 비즈니스 로직
 * - 아이디/비밀번호 로그인
 * - 에러 처리 (계정 잠금, 비밀번호 만료 등)
 */

import { useRouter } from "next/navigation";
import type { Route } from "next";
import {
  useLoginGeneral,
  useMemberStore,
  parseMemberError,
  MEMBER_ERROR_CODES,
  type LoginGeneralRequest,
} from "@/domains/member/model";
import { toast } from "sonner";

export function useGeneralLoginFlow() {
  const router = useRouter();
  const memberStore = useMemberStore();

  const loginGeneral = useLoginGeneral();

  /**
   * 일반 로그인
   */
  const handleLogin = async (data: LoginGeneralRequest) => {
    try {
      const result = await loginGeneral.mutateAsync(data);

      // ✅ Feature의 정책: 로그인 성공
      memberStore.setMember(result.member);
      toast.success("로그인되었습니다");
      router.push("/main" as Route);
    } catch (error) {
      const parsed = parseMemberError(error);

      // ✅ Feature의 정책: 에러별 분기 처리
      if (parsed.code === MEMBER_ERROR_CODES.INVALID_CREDENTIALS) {
        toast.error("아이디 또는 비밀번호가 일치하지 않습니다");
      } else if (parsed.code === MEMBER_ERROR_CODES.USER_NOT_FOUND) {
        toast.error("존재하지 않는 회원입니다");
      } else if (parsed.code === MEMBER_ERROR_CODES.ACCOUNT_LOCKED) {
        toast.error("계정이 잠겼습니다. 고객센터로 문의해주세요");
        router.push("/support" as Route);
      } else if (parsed.code === MEMBER_ERROR_CODES.PASSWORD_EXPIRED) {
        toast.error("비밀번호 변경이 필요합니다 (90일 경과)");
        router.push("/member/reset-password" as Route);
      } else {
        toast.error(parsed.message);
      }
    }
  };

  return {
    handleLogin,
    isLoggingIn: loginGeneral.isPending,
  };
}
