/**
 * Feature: Member - 일반 회원가입 플로우
 * 
 * 역할: 일반 회원가입 비즈니스 로직
 * 1. PASS 본인인증 완료
 * 2. checkUserStatus API 호출
 * 3. 신규 회원 → verificationToken 저장 + 회원가입 폼으로
 * 4. 기존 회원 → 로그인 완료
 * 5. 연동 필요 → 계정 연동 화면으로
 */

import { useRouter } from "next/navigation";
import type { Route } from "next";
import {
  useCheckUserStatus,
  useRegisterGeneral,
  useMemberStore,
  parseMemberError,
  MEMBER_ERROR_CODES,
  type RegisterGeneralRequest,
} from "@/domains/member/model";
import { toast } from "sonner";

export function useGeneralSignupFlow() {
  const router = useRouter();
  const memberStore = useMemberStore();

  const checkStatus = useCheckUserStatus();
  const registerGeneral = useRegisterGeneral();

  /**
   * Step 1: PASS 본인인증 완료 후 회원 상태 조회
   */
  const handleVerificationComplete = async (transactionId: string) => {
    try {
      const result = await checkStatus.mutateAsync({ transactionId });

      // ✅ Feature의 정책: 신규 회원
      if (result.status === "NEW_USER") {
        memberStore.setVerificationToken({
          token: result.verificationToken,
          expiresAt: Date.now() + 15 * 60 * 1000, // 15분
        });

        toast.success("본인인증이 완료되었습니다");
        router.push("/member/signup/credentials" as Route);
        return;
      }

      // ✅ Feature의 정책: 기존 회원 (이미 가입됨)
      if (result.status === "EXISTING_USER") {
        memberStore.setMember(result.member);
        toast.info("이미 가입된 회원입니다. 로그인 페이지로 이동합니다");
        router.push("/member/login" as Route);
        return;
      }

      // ✅ Feature의 정책: 계정 연동 필요
      if (result.status === "LINK_REQUIRED") {
        memberStore.setLinkToken({
          token: result.linkToken,
          userUlid: result.existingMember.mbrUlid,
          expiresAt: Date.now() + 5 * 60 * 1000, // 5분
        });

        toast.info("기존 계정에 연동할 수 있습니다");
        router.push("/member/link-account" as Route);
        return;
      }
    } catch (error) {
      const parsed = parseMemberError(error);

      // ✅ Feature의 정책: 에러 처리
      if (parsed.code === MEMBER_ERROR_CODES.UNDER_AGE) {
        toast.error(parsed.message);
        router.push("/" as Route); // 메인으로
      } else if (parsed.code === MEMBER_ERROR_CODES.INVALID_TRANSACTION_ID) {
        toast.error("본인인증 정보가 유효하지 않습니다");
        router.push("/member/signup" as Route);
      } else {
        toast.error(parsed.message);
      }
    }
  };

  /**
   * Step 2: 회원가입 폼 제출
   */
  const handleRegister = async (data: {
    wellnessId: string;
    password: string;
    nickname: string;
    email?: string;
    agreeMarketing: boolean;
  }) => {
    const verificationToken = memberStore.verificationToken;

    // ✅ Feature의 정책: verificationToken 검증
    if (!verificationToken) {
      toast.error("본인인증이 필요합니다");
      router.push("/member/signup" as Route);
      return;
    }

    // ✅ Feature의 정책: 토큰 만료 검증
    if (verificationToken.expiresAt < Date.now()) {
      toast.error("인증이 만료되었습니다. 다시 인증해주세요");
      memberStore.clearVerificationToken();
      router.push("/member/signup" as Route);
      return;
    }

    try {
      const request: RegisterGeneralRequest = {
        verificationToken: verificationToken.token,
        wellnessId: data.wellnessId,
        password: data.password,
        nickname: data.nickname,
        email: data.email,
        agreeMarketing: data.agreeMarketing,
      };

      const result = await registerGeneral.mutateAsync(request);

      // ✅ Feature의 정책: 회원가입 성공
      memberStore.setMember(result.member);
      memberStore.clearVerificationToken();

      toast.success("회원가입이 완료되었습니다!");
      router.push("/member/signup/complete" as Route);
    } catch (error) {
      const parsed = parseMemberError(error);

      // ✅ Feature의 정책: 에러 처리
      if (parsed.code === MEMBER_ERROR_CODES.DUPLICATED_WELLNESS_ID) {
        toast.error("이미 사용 중인 아이디입니다");
      } else if (parsed.code === MEMBER_ERROR_CODES.EXPIRED_VERIFICATION_TOKEN) {
        toast.error("인증이 만료되었습니다. 다시 인증해주세요");
        memberStore.clearVerificationToken();
        router.push("/member/signup" as Route);
      } else {
        toast.error(parsed.message);
      }
    }
  };

  return {
    handleVerificationComplete,
    handleRegister,
    isCheckingStatus: checkStatus.isPending,
    isRegistering: registerGeneral.isPending,
  };
}
