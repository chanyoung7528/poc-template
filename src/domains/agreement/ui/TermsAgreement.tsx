/**
 * Domain UI: Agreement - TermsAgreement
 * 
 * 역할: 약관 동의 컴포넌트
 * - API에서 약관 목록 조회
 * - 필수/선택 약관 구분
 * - 전체 동의 기능
 */

"use client";

import { useState, useEffect } from "react";
import { useAgreementList } from "@/domains/agreement/model";
import styles from "./TermsAgreement.module.scss";

interface TermsAgreementProps {
  onAgree: (agreements: Record<string, boolean>) => void;
  showError?: boolean;
  onSubmit?: () => void;
}

export function TermsAgreement({
  onAgree,
  showError,
  onSubmit,
}: TermsAgreementProps) {
  const { data: agreementListData, isLoading } = useAgreementList();
  const agreements = agreementListData?.data || [];

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

  const handleToggle = (agrmNo: string) => {
    const newAgreed = { ...agreedState, [agrmNo]: !agreedState[agrmNo] };
    setAgreedState(newAgreed);
    onAgree(newAgreed);
  };

  const handleToggleAll = () => {
    const allChecked = agreements.every((a) => agreedState[a.agrmNo]);
    const newAgreed: Record<string, boolean> = {};

    agreements.forEach((agreement) => {
      newAgreed[agreement.agrmNo] = !allChecked;
    });

    setAgreedState(newAgreed);
    onAgree(newAgreed);
  };

  const handleSubmit = () => {
    if (isRequiredAgreed) {
      onSubmit?.();
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
                window.open(`/agreement/${agreement.agrmNo}`, "_blank")
              }
              className={styles.linkButton}
            >
              보기
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
