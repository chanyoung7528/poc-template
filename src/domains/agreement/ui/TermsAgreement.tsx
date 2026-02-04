/**
 * Domain UI: Agreement - TermsAgreement
 *
 * 역할: 약관 동의 컴포넌트
 * - API에서 약관 목록 조회
 * - 필수/선택 약관 구분
 * - 전체 동의 기능
 */

"use client";

import { useState, useEffect, useMemo } from "react";
import { useAgreementList } from "@/domains/agreement/model";
import type { Agreement as AgreementConsent } from "@/domains/member/model";
import styles from "./TermsAgreement.module.scss";
import { usePopup } from "@/shared/hooks/usePopup";

interface TermsAgreementProps {
  onAgree?: (agreements: AgreementConsent[]) => void;
  showError?: boolean;
  onSubmit?: (agreements: AgreementConsent[]) => void;
}

export function TermsAgreement({
  onAgree,
  showError,
  onSubmit,
}: TermsAgreementProps) {
  const { data: agreementListData, isLoading } = useAgreementList();
  const agreements = agreementListData?.data || [];

  const { open } = usePopup();

  // 약관별 동의 상태 (agrmNo를 키로 사용)
  const [agreedState, setAgreedState] = useState<Record<string, boolean>>({});

  // 약관 목록 로드 시 초기 상태 설정
  useEffect(() => {
    if (agreements.length > 0) {
      const initialState: Record<string, boolean> = {};
      agreements.forEach((agreement) => {
        initialState[agreement.agrmNo] = false;
      });
      setAgreedState(initialState);
    }
  }, [agreements]);

  // 동의한 약관을 Agreement[] 형태로 변환
  const getAgreementConsents = useMemo(() => {
    return (state: Record<string, boolean>): AgreementConsent[] => {
      console.log("🔄 getAgreementConsents 호출");
      console.log("🔄 agreements 길이:", agreements.length);
      console.log("🔄 state:", state);

      if (agreements.length === 0) {
        console.error("❌ agreements 배열이 비어있습니다!");
        return [];
      }

      const consents = agreements
        .filter((agreement) => state[agreement.agrmNo] === true)
        .map((agreement) => ({
          agrmNo: agreement.agrmNo,
          agrYn: "Y" as const,
        }));

      console.log("🔄 생성된 consents:", consents);
      return consents;
    };
  }, [agreements]);

  const handleToggle = (agrmNo: string) => {
    const newAgreed = { ...agreedState, [agrmNo]: !agreedState[agrmNo] };
    setAgreedState(newAgreed);

    // 실시간 업데이트 (선택사항)
    if (onAgree) {
      onAgree(getAgreementConsents(newAgreed));
    }
  };

  const handleToggleAll = () => {
    const allChecked = agreements.every((a) => agreedState[a.agrmNo]);
    const newAgreed: Record<string, boolean> = {};

    agreements.forEach((agreement) => {
      newAgreed[agreement.agrmNo] = !allChecked;
    });

    setAgreedState(newAgreed);

    // 실시간 업데이트 (선택사항)
    if (onAgree) {
      onAgree(getAgreementConsents(newAgreed));
    }
  };

  const handleSubmit = () => {
    console.log("📝 TermsAgreement handleSubmit 호출");
    console.log("📝 isRequiredAgreed:", isRequiredAgreed);
    console.log("📝 agreedState:", agreedState);

    if (isRequiredAgreed) {
      const consents = getAgreementConsents(agreedState);
      console.log("📝 생성된 consents:", consents);
      console.log("📝 consents 길이:", consents.length);

      if (consents.length === 0) {
        console.error("❌ consents가 비어있습니다!");
        return;
      }

      onSubmit?.(consents);
    } else {
      console.warn("⚠️ 필수 약관에 동의하지 않았습니다");
    }
  };

  // 전체 동의 여부
  const isAllChecked = agreements.every((a) => agreedState[a.agrmNo]);

  // 필수 약관 모두 동의 여부
  const requiredAgreements = agreements.filter((a) => a.isRequired);
  const isRequiredAgreed = requiredAgreements.every(
    (a) => agreedState[a.agrmNo]
  );

  if (isLoading) {
    return (
      <div className={styles.termsAgreement}>
        <p className={styles.loading}>약관을 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className={styles.termsAgreement}>
      {/* 전체 동의 */}
      <div className={`${styles.checkboxItem} ${styles.allAgree}`}>
        <input
          type="checkbox"
          id="all"
          checked={isAllChecked}
          onChange={handleToggleAll}
          className={styles.checkbox}
        />
        <label htmlFor="all" className={styles.label}>
          전체 동의
        </label>
      </div>

      <div className={styles.divider} />

      {/* 약관 목록 */}
      <div className={styles.checkboxGroup}>
        {agreements.map((agreement) => (
          <div key={agreement.agrmNo} className={styles.checkboxItem}>
            <input
              type="checkbox"
              id={agreement.agrmNo}
              checked={agreedState[agreement.agrmNo] || false}
              onChange={() => handleToggle(agreement.agrmNo)}
              className={styles.checkbox}
            />
            <label
              htmlFor={agreement.agrmNo}
              className={`${styles.label} ${
                agreement.isRequired ? styles.required : ""
              }`}
            >
              {agreement.agrmTit}
              {agreement.isRequired && (
                <span className={styles.requiredBadge}>(필수)</span>
              )}
            </label>
            <button
              type="button"
              onClick={() =>
                open({
                  title: agreement.agrmTit,
                  content: agreement.agrmCont,
                  onBeforeClose: async () => {
                    console.info("비동기 작업 시작...");
                    await new Promise((resolve) => setTimeout(resolve, 500));
                    console.info("비동기 작업 완료");
                    return false;
                  },
                })
              }
              className={styles.linkButton}
            >
              보기22
            </button>
          </div>
        ))}
      </div>

      {showError && !isRequiredAgreed && (
        <span className={styles.errorMessage}>필수 약관에 동의해주세요</span>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!isRequiredAgreed}
        className={styles.submitButton}
      >
        동의하기
      </button>
    </div>
  );
}
