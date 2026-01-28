/**
 * Page: Member - 약관 동의
 * 
 * 역할: 약관 동의 페이지
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TermsAgreement } from "@/domains/agreement/ui/TermsAgreement";
import { TermsAgreementTitle } from "@/domains/agreement/ui/TermsAgreementTitle";
import { useMemberStore } from "@/domains/member/model";
import { useSaveAgreements } from "@/domains/member/model";
import { toast } from "sonner";

export default function MemberTermsAgreementPage() {
  const router = useRouter();
  const memberStore = useMemberStore();
  const saveAgreements = useSaveAgreements();

  const [agreedState, setAgreedState] = useState<Record<string, boolean>>({});

  const handleAgree = (agreements: Record<string, boolean>) => {
    setAgreedState(agreements);
  };

  const handleSubmit = async () => {
    // TODO: 필수 약관 체크 로직을 agreements 데이터 기반으로 수정 필요
    
    try {
      // 약관 동의 저장 (Optional)
      await saveAgreements.mutateAsync({
        agreeTerms: true,
        agreePrivacy: true,
        agreeMarketing: false,
      });

      toast.success("약관 동의 완료");

      // 본인인증 페이지로 이동
      router.push("/member/verify");
    } catch (error) {
      toast.error("약관 동의 처리 중 오류가 발생했습니다");
    }
  };

  return (
    <>
      <TermsAgreementTitle />
      <TermsAgreement
        onAgree={handleAgree}
        onSubmit={handleSubmit}
        showError={false}
      />
    </>
  );
}
