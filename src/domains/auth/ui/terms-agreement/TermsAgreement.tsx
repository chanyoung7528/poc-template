'use client';

import { useState } from 'react';
import styles from './TermsAgreement.module.scss';

interface TermsAgreementProps {
  onAgree: (agreed: {
    terms: boolean;
    privacy: boolean;
    marketing: boolean;
  }) => void;
  showError?: boolean;
  onSubmit?: () => void;
}

export function TermsAgreement({
  onAgree,
  showError,
  onSubmit,
}: TermsAgreementProps) {
  const [agreed, setAgreed] = useState({
    terms: false,
    privacy: false,
    marketing: false,
  });

  const handleToggle = (key: keyof typeof agreed) => {
    const newAgreed = { ...agreed, [key]: !agreed[key] };
    setAgreed(newAgreed);
    onAgree(newAgreed);
  };

  const handleToggleAll = () => {
    const allChecked = agreed.terms && agreed.privacy && agreed.marketing;
    const newAgreed = {
      terms: !allChecked,
      privacy: !allChecked,
      marketing: !allChecked,
    };
    setAgreed(newAgreed);
    onAgree(newAgreed);
  };

  const handleSubmit = () => {
    if (isRequiredAgreed) {
      onSubmit?.();
    }
  };

  const isAllChecked = agreed.terms && agreed.privacy && agreed.marketing;
  const isRequiredAgreed = agreed.terms && agreed.privacy;

  return (
    <div className={styles.termsAgreement}>
      <div className={styles.checkboxGroup}>
        <div className={styles.checkboxItem}>
          <input
            type="checkbox"
            id="terms"
            checked={agreed.terms}
            onChange={() => handleToggle('terms')}
            className={styles.checkbox}
          />
          <label
            htmlFor="terms"
            className={`${styles.label} ${styles.required}`}
          >
            서비스 이용약관 동의
          </label>
          <button
            type="button"
            onClick={() => window.open('/terms', '_blank')}
            className={styles.linkButton}
          >
            보기
          </button>
        </div>

        <div className={styles.checkboxItem}>
          <input
            type="checkbox"
            id="privacy"
            checked={agreed.privacy}
            onChange={() => handleToggle('privacy')}
            className={styles.checkbox}
          />
          <label
            htmlFor="privacy"
            className={`${styles.label} ${styles.required}`}
          >
            개인정보 처리방침 동의
          </label>
          <button
            type="button"
            onClick={() => window.open('/privacy', '_blank')}
            className={styles.linkButton}
          >
            보기
          </button>
        </div>

        <div className={styles.checkboxItem}>
          <input
            type="checkbox"
            id="marketing"
            checked={agreed.marketing}
            onChange={() => handleToggle('marketing')}
            className={styles.checkbox}
          />
          <label htmlFor="marketing" className={styles.label}>
            마케팅 정보 수신 동의 (선택)
          </label>
        </div>
      </div>

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

      {showError && (!agreed.terms || !agreed.privacy) && (
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
