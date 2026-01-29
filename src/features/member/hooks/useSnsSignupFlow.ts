/**
 * Feature: Member - SNS 회원가입 플로우
 * 
 * 역할: SNS 회원가입 비즈니스 로직
 * 1. SNS 로그인 → checkSnsUser API → registerToken 저장
 * 2. 약관 동의 → Store 저장
 * 3. 본인인증 → transactionId 저장
 * 4. 회원가입 완료 → registerSnsUser API → 회원 생성 + 쿠키 설정
 */

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useCheckSnsUser,
  useRegisterSnsUser,
  useMemberStore,
  type Agreement,
} from "@/domains/member/model";

export function useSnsSignupFlow() {
  const router = useRouter();
  const memberStore = useMemberStore();
  const checkSnsUser = useCheckSnsUser();
  const registerSnsUser = useRegisterSnsUser();

  /**
   * STEP 1: SNS 로그인 완료 처리
   * - checkSnsUser API 호출
   * - registerToken 발급 받아서 Store 저장
   */
  const handleSnsLoginComplete = async (
    snsType: "KAKAO" | "NAVER" | "APPLE",
    accessToken: string
  ) => {
    // SNS 정보 저장
    memberStore.setSnsInfo(snsType, accessToken);

    try {
      const result = await checkSnsUser.mutateAsync({
        snsType,
        accessToken,
      });

      if (result.data.status === "new") {
        // registerToken 저장
        if (result.data.registerToken) {
          memberStore.setRegisterToken(result.data.registerToken);
          toast.success("SNS 로그인이 완료되었습니다");
          
          // 약관 동의 페이지로 이동
          router.push("/member/terms-agreement?type=sns");
        } else {
          toast.error("인증 토큰을 받지 못했습니다");
        }
      } else if (result.data.status === "duplicate") {
        toast.success("로그인 성공!");
        // TODO: 이미 가입된 회원 → 로그인 처리
        router.push("/");
      } else if (result.data.status === "link_required") {
        toast.info("계정 연동이 필요합니다");
        // TODO: 계정 연동 페이지로 이동
      }
    } catch (error) {
      toast.error("SNS 로그인 처리 중 오류가 발생했습니다");
      console.error("SNS login error:", error);
    }
  };

  /**
   * STEP 2: 약관 동의 처리
   * - Store에 저장만 (API 통신 X)
   * - agreements: [{ agrmNo: "AGRM20250101001", agrYn: "Y" }, ...]
   */
  const handleAgreements = (agreements: Agreement[]) => {
    // 필수 약관 동의 여부 확인 (최소 1개 이상)
    if (agreements.length === 0) {
      toast.error("필수 약관에 동의해주세요");
      return;
    }

    console.log("약관 동의 데이터 (SNS):", agreements);

    // Store에 저장
    memberStore.setSnsAgreements(agreements);
    
    // 약관 동의 완료 (페이지 이동 없음 - PortOne이 바로 시작됨)
  };

  /**
   * STEP 3: 본인인증 완료 처리
   * - transactionId 저장
   * - 회원가입 API 호출
   */
  const handleVerificationComplete = async (transactionId: string) => {
    // 토큰 유효성 검증
    if (!memberStore.isRegisterTokenValid()) {
      toast.error("인증 시간이 만료되었습니다. SNS 로그인을 다시 진행해주세요");
      router.push("/member/signup");
      return;
    }

    // transactionId 저장
    memberStore.setTransactionId(transactionId);

    const { snsSignupData } = memberStore;

    if (!snsSignupData.registerToken) {
      toast.error("SNS 로그인이 필요합니다");
      router.push("/member/signup");
      return;
    }

    try {
      const result = await registerSnsUser.mutateAsync({
        registerToken: snsSignupData.registerToken,
        transactionId,
        agreements: snsSignupData.agreements || [],
        hegtVal: snsSignupData.hegtVal,
        wegtVal: snsSignupData.wegtVal,
        actAmountCd: snsSignupData.actAmountCd,
      });

      // 회원 정보 저장
      memberStore.setMember({
        mbrUlid: result.data.mbrUlid,
        oppbId: result.data.oppbId,
      });

      // SNS 회원가입 데이터 초기화
      memberStore.clearSnsSignupData();

      toast.success("회원가입이 완료되었습니다!");
      router.push("/member/signup/complete");
    } catch (error) {
      toast.error("회원가입 처리 중 오류가 발생했습니다");
      console.error("SNS register error:", error);
    }
  };

  return {
    handleSnsLoginComplete,
    handleAgreements,
    handleVerificationComplete,
    isLoading: checkSnsUser.isPending || registerSnsUser.isPending,
  };
}
