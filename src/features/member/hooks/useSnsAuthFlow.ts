/**
 * Feature: Member - SNS 인증 플로우
 * 
 * 역할: SNS 로그인/회원가입 비즈니스 로직
 * 1. SNS 로그인 시도 (카카오/네이버/애플)
 * 2. checkSnsUser API 호출
 * 3. 기존 회원 → 로그인 완료
 * 4. 미가입 → registerToken 저장 + PASS 본인인증 유도
 * 5. 연동 필요 → linkToken 저장 + 계정 연동 화면으로
 */

import { useRouter } from "next/navigation";
import type { Route } from "next";
import {
  useCheckSnsUser,
  useRegisterSns,
  useLoginSns,
  useMemberStore,
  parseMemberError,
  MEMBER_ERROR_CODES,
  type SnsType,
  type RegisterSnsRequest,
} from "@/domains/member/model";
import { toast } from "sonner";

export function useSnsAuthFlow() {
  const router = useRouter();
  const memberStore = useMemberStore();

  const checkSnsUser = useCheckSnsUser();
  const registerSns = useRegisterSns();
  const loginSns = useLoginSns();

  /**
   * Step 1: SNS 로그인 성공 후 회원 조회
   */
  const handleSnsLoginSuccess = async (data: {
    snsType: SnsType;
    snsId: string;
    snsEmail?: string;
  }) => {
    try {
      const result = await checkSnsUser.mutateAsync(data);

      // ✅ Feature의 정책: 기존 회원 (SNS 로그인 완료)
      if (result.status === "EXISTING_USER") {
        // 로그인 API 호출 (쿠키 설정)
        const loginResult = await loginSns.mutateAsync(data);

        memberStore.setMember(loginResult.member);
        toast.success("로그인되었습니다");
        router.push("/main" as Route);
        return;
      }

      // ✅ Feature의 정책: 미가입 (SNS 간편가입 필요)
      if (result.status === "REGISTER_REQUIRED") {
        memberStore.setRegisterToken({
          token: result.registerToken,
          snsType: data.snsType,
          expiresAt: Date.now() + 5 * 60 * 1000, // 5분
        });

        toast.info("간편 회원가입을 진행합니다");
        router.push("/member/signup/sns" as Route);
        return;
      }

      // ✅ Feature의 정책: 계정 연동 필요
      if (result.status === "LINK_REQUIRED") {
        memberStore.setLinkToken({
          token: result.linkToken,
          userUlid: result.existingMember.mbrUlid,
          expiresAt: Date.now() + 5 * 60 * 1000, // 5분
        });

        memberStore.setRegisterToken({
          token: result.linkToken, // registerToken도 함께 저장
          snsType: data.snsType,
          expiresAt: Date.now() + 5 * 60 * 1000,
        });

        toast.info("기존 계정에 SNS 로그인을 연동할 수 있습니다");
        router.push("/member/link-account" as Route);
        return;
      }
    } catch (error) {
      const parsed = parseMemberError(error);
      toast.error(parsed.message);
    }
  };

  /**
   * Step 2: SNS 간편가입 (PASS 본인인증 완료 후)
   */
  const handleSnsRegister = async (data: {
    transactionId: string;
    nickname: string;
    agreeMarketing: boolean;
  }) => {
    const registerToken = memberStore.registerToken;

    // ✅ Feature의 정책: registerToken 검증
    if (!registerToken) {
      toast.error("SNS 로그인 정보가 없습니다");
      router.push("/member/login" as Route);
      return;
    }

    // ✅ Feature의 정책: 토큰 만료 검증
    if (registerToken.expiresAt < Date.now()) {
      toast.error("인증이 만료되었습니다. 다시 로그인해주세요");
      memberStore.clearRegisterToken();
      router.push("/member/login" as Route);
      return;
    }

    try {
      const request: RegisterSnsRequest = {
        registerToken: registerToken.token,
        transactionId: data.transactionId,
        nickname: data.nickname,
        agreeMarketing: data.agreeMarketing,
      };

      const result = await registerSns.mutateAsync(request);

      // ✅ Feature의 정책: 회원가입 성공
      memberStore.setMember(result.member);
      memberStore.clearRegisterToken();

      toast.success("회원가입이 완료되었습니다!");
      router.push("/member/signup/complete" as Route);
    } catch (error) {
      const parsed = parseMemberError(error);

      // ✅ Feature의 정책: 에러 처리
      if (parsed.code === MEMBER_ERROR_CODES.EXPIRED_REGISTER_TOKEN) {
        toast.error("인증이 만료되었습니다. 다시 로그인해주세요");
        memberStore.clearRegisterToken();
        router.push("/member/login" as Route);
      } else if (parsed.code === MEMBER_ERROR_CODES.DUPLICATED_SNS_USER) {
        toast.error("이미 가입된 SNS 계정입니다");
        router.push("/member/login" as Route);
      } else {
        toast.error(parsed.message);
      }
    }
  };

  return {
    handleSnsLoginSuccess,
    handleSnsRegister,
    isCheckingSnsUser: checkSnsUser.isPending,
    isLoggingIn: loginSns.isPending,
    isRegistering: registerSns.isPending,
  };
}
