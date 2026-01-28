/**
 * Feature: Member - 계정 연동 플로우
 * 
 * 역할: 계정 연동 비즈니스 로직
 * - 케이스 A: SNS 계정에 일반 로그인 추가
 * - 케이스 B: 일반 계정에 SNS 로그인 추가
 */

import { useRouter } from "next/navigation";
import type { Route } from "next";
import {
  useLinkGeneral,
  useLinkSns,
  useMemberStore,
  parseMemberError,
  MEMBER_ERROR_CODES,
  type LinkGeneralRequest,
  type LinkSnsRequest,
} from "@/domains/member/model";
import { toast } from "sonner";

export function useAccountLinkFlow() {
  const router = useRouter();
  const memberStore = useMemberStore();

  const linkGeneral = useLinkGeneral();
  const linkSns = useLinkSns();

  /**
   * 케이스 A: SNS 계정에 일반 로그인 추가
   */
  const handleLinkGeneral = async (data: {
    wellnessId: string;
    password: string;
  }) => {
    const linkToken = memberStore.linkToken;

    // ✅ Feature의 정책: linkToken 검증
    if (!linkToken) {
      toast.error("연동 정보가 없습니다");
      router.push("/member/login" as Route);
      return;
    }

    // ✅ Feature의 정책: 토큰 만료 검증
    if (linkToken.expiresAt < Date.now()) {
      toast.error("연동 시간이 만료되었습니다. 다시 시도해주세요");
      memberStore.clearLinkToken();
      router.push("/member/login" as Route);
      return;
    }

    try {
      const request: LinkGeneralRequest = {
        linkToken: linkToken.token,
        wellnessId: data.wellnessId,
        password: data.password,
      };

      const result = await linkGeneral.mutateAsync(request);

      // ✅ Feature의 정책: 연동 성공
      memberStore.setMember(result.member);
      memberStore.clearLinkToken();

      toast.success("일반 로그인이 연동되었습니다!");
      router.push("/main" as Route);
    } catch (error) {
      const parsed = parseMemberError(error);

      // ✅ Feature의 정책: 에러 처리
      if (parsed.code === MEMBER_ERROR_CODES.EXPIRED_LINK_TOKEN) {
        toast.error("연동 시간이 만료되었습니다");
        memberStore.clearLinkToken();
        router.push("/member/login" as Route);
      } else if (parsed.code === MEMBER_ERROR_CODES.ALREADY_LINKED) {
        toast.error("이미 연동된 계정입니다");
        router.push("/member/login" as Route);
      } else if (parsed.code === MEMBER_ERROR_CODES.DUPLICATED_WELLNESS_ID) {
        toast.error("이미 사용 중인 아이디입니다");
      } else {
        toast.error(parsed.message);
      }
    }
  };

  /**
   * 케이스 B: 일반 계정에 SNS 로그인 추가
   */
  const handleLinkSns = async () => {
    const linkToken = memberStore.linkToken;
    const registerToken = memberStore.registerToken;

    // ✅ Feature의 정책: 토큰 검증
    if (!linkToken || !registerToken) {
      toast.error("연동 정보가 없습니다");
      router.push("/member/login" as Route);
      return;
    }

    // ✅ Feature의 정책: 토큰 만료 검증
    if (linkToken.expiresAt < Date.now()) {
      toast.error("연동 시간이 만료되었습니다");
      memberStore.clearAllTokens();
      router.push("/member/login" as Route);
      return;
    }

    try {
      const request: LinkSnsRequest = {
        linkToken: linkToken.token,
        registerToken: registerToken.token,
      };

      const result = await linkSns.mutateAsync(request);

      // ✅ Feature의 정책: 연동 성공
      memberStore.setMember(result.member);
      memberStore.clearAllTokens();

      toast.success(
        `${registerToken.snsType} 로그인이 연동되었습니다!`
      );
      router.push("/main" as Route);
    } catch (error) {
      const parsed = parseMemberError(error);

      // ✅ Feature의 정책: 에러 처리
      if (parsed.code === MEMBER_ERROR_CODES.EXPIRED_LINK_TOKEN) {
        toast.error("연동 시간이 만료되었습니다");
        memberStore.clearAllTokens();
        router.push("/member/login" as Route);
      } else if (parsed.code === MEMBER_ERROR_CODES.ALREADY_LINKED) {
        toast.error("이미 연동된 SNS 계정입니다");
        router.push("/member/login" as Route);
      } else {
        toast.error(parsed.message);
      }
    }
  };

  return {
    handleLinkGeneral,
    handleLinkSns,
    isLinkingGeneral: linkGeneral.isPending,
    isLinkingSns: linkSns.isPending,
  };
}
