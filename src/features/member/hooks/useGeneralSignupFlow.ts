/**
 * Feature: Member - 일반 회원가입 플로우
 *
 * 역할: 일반 회원가입 비즈니스 로직
 * 1. 약관 동의 → Store 저장
 * 2. 본인인증 → checkUserStatus API → verificationToken 저장
 * 3. 회원가입 폼 → registerGeneral API → 회원 생성 + 쿠키 설정
 */

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  useCheckUserStatus,
  useRegisterGeneral,
  useMemberStore,
  type Agreement,
} from "@/domains/member/model";

export function useGeneralSignupFlow() {
  const router = useRouter();
  const memberStore = useMemberStore();
  // selector를 사용하여 최신 generalSignupData 가져오기
  const generalSignupData = useMemberStore((state) => state.generalSignupData);
  const checkUserStatus = useCheckUserStatus();
  const registerGeneral = useRegisterGeneral();

  /**
   * STEP 1: 약관 동의 처리
   * - Store에 저장만 (API 통신 X)
   * - agreements: [{ agrmNo: "AGRM20250101001", agrYn: "Y" }, ...]
   */
  const handleAgreements = (agreements: Agreement[]) => {
    console.log("🔵 handleAgreements 호출:", agreements);
    console.log("🔵 agreements 길이:", agreements.length);
    
    // 필수 약관 동의 여부 확인 (최소 1개 이상)
    if (!agreements || agreements.length === 0) {
      console.error("❌ agreements가 비어있습니다!");
      toast.error("필수 약관에 동의해주세요");
      return;
    }

    // Store에 저장
    memberStore.setAgreements(agreements);
    
    // 저장 확인 (Zustand store 인스턴스에서 getState 호출)
    // Zustand의 create()는 hook과 store 인스턴스를 모두 반환하므로 getState 사용 가능
    try {
      const storeState = (useMemberStore as any).getState?.();
      if (storeState) {
        const saved = storeState.generalSignupData?.agreements;
        console.log("✅ Store에 저장된 agreements:", saved);
        console.log("✅ 저장된 agreements 길이:", saved?.length || 0);
      }
    } catch (error) {
      // getState가 없으면 무시 (디버깅용이므로)
      console.log("✅ agreements 저장 완료 (getState 확인 불가)");
    }

    // 약관 동의 완료 (페이지 이동 없음 - PortOne이 바로 시작됨)
  };

  /**
   * STEP 2: 본인인증 완료 처리
   * - checkUserStatus API 호출 (REST API fetch)
   * - verificationToken 발급 받아서 Store 저장
   */
  const handleVerificationComplete = async (transactionId: string) => {
    try {
      console.log("🔄 checkUserStatus API 호출 시작:", transactionId);
      const result = await checkUserStatus.mutateAsync({ transactionId });
      console.log("✅ checkUserStatus API 응답:", result);

      if (result.data.status === "new") {
        // verificationToken 저장
        if (result.data.verificationToken) {
          const tokenValue = result.data.verificationToken;
          console.log("💾 verificationToken 저장 중:", tokenValue);

          // Store에 저장
          memberStore.setVerificationToken(tokenValue);

          console.log("✅ verificationToken 저장 완료:", tokenValue);
          toast.success("본인인증이 완료되었습니다");

          // 이미 /member/signup/credentials 페이지에 있으면 이동하지 않음
          if (
            typeof window !== "undefined" &&
            !window.location.pathname.includes("/member/signup/credentials")
          ) {
            router.push("/member/signup/credentials");
          }
        } else {
          console.error("❌ verificationToken이 응답에 없습니다");
          toast.error("인증 토큰을 받지 못했습니다");
        }
      } else if (result.data.status === "duplicate") {
        toast.error("이미 가입된 회원입니다");
        router.push("/");
      } else if (result.data.status === "link_required") {
        toast.info("계정 연동이 필요합니다");
        // TODO: 계정 연동 페이지로 이동
      }
    } catch (error) {
      toast.error("본인인증 처리 중 오류가 발생했습니다");
      console.error("❌ Verification error:", error);
      throw error; // 상위에서 처리할 수 있도록 에러 전파
    }
  };

  /**
   * STEP 3: 회원가입 폼 제출
   * - Store에서 모든 데이터 수집
   * - registerGeneral API 호출
   */
  const handleRegister = async (loginId: string, password: string) => {
    // 토큰 유효성 검증
    if (!memberStore.isVerificationTokenValid()) {
      toast.error("인증 시간이 만료되었습니다. 다시 본인인증을 진행해주세요");
      router.push("/member/verify");
      return;
    }

    // Credentials 저장
    memberStore.setCredentials(loginId, password);

    const { generalSignupData } = memberStore;
    console.log("  generalSignupData", generalSignupData);
    if (!generalSignupData.verificationToken) {
      toast.error("본인인증이 필요합니다");
      router.push("/member/verify");
      return;
    }

    try {
      const result = await registerGeneral.mutateAsync({
        verificationToken: generalSignupData.verificationToken,
        loginId,
        password,
        agreements: generalSignupData.agreements || [],
        hegtVal: generalSignupData.hegtVal,
        wegtVal: generalSignupData.wegtVal,
        actAmountCd: generalSignupData.actAmountCd,
        pushTknCont: generalSignupData.pushTknCont,
        dvcId: generalSignupData.dvcId,
        dvcTpCd: generalSignupData.dvcTpCd,
        dvcMdlNm: generalSignupData.dvcMdlNm,
        osVerNm: generalSignupData.osVerNm,
        appVerNm: generalSignupData.appVerNm,
      });

      // 회원 정보 저장
      memberStore.setMember({
        mbrUlid: result.data.mbrUlid,
        oppbId: result.data.oppbId,
      });

      // 회원가입 데이터 초기화
      memberStore.clearGeneralSignupData();

      toast.success("회원가입이 완료되었습니다!");
      router.push("/member/signup/complete");
    } catch (error) {
      toast.error("회원가입 처리 중 오류가 발생했습니다");
      console.error("Register error:", error);
    }
  };

  return {
    handleAgreements,
    handleVerificationComplete,
    handleRegister,
    isLoading: checkUserStatus.isPending || registerGeneral.isPending,
  };
}
