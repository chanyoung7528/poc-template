"use client";

import { ClearIcon } from "@/shared/ui/icon/ClearIcon";
import { useEffect, useState } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { useController } from "react-hook-form";
import styles from "./WellnessIdInput.module.scss";

interface ValidationRule {
  label: string;
  check: (value: string) => boolean;
}

interface WellnessIdInputProps<T extends FieldValues = FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  onDuplicateCheck?: (value: string) => Promise<boolean>; // true면 중복, false면 사용가능
}

const VALIDATION_RULES: ValidationRule[] = [
  {
    label: "영문 소문자",
    check: (value: string) => /[a-z]/.test(value) && /^[a-z0-9]*$/.test(value),
  },
  {
    label: "숫자",
    check: (value: string) => /\d/.test(value),
  },
  {
    label: "10-15자",
    check: (value: string) => value.length >= 10 && value.length <= 15,
  },
];

export function WellnessIdInput<T extends FieldValues = FieldValues>({
  name,
  control,
  label = "아이디",
  placeholder = "아이디를 입력해주세요",
  onDuplicateCheck,
}: WellnessIdInputProps<T>) {
  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const [isFocused, setIsFocused] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState<boolean | null>(null);
  const [hasDuplicateCheck, setHasDuplicateCheck] = useState(false);

  const value = field.value ?? "";
  const hasValue = String(value).length > 0;

  // 각 규칙의 통과 여부 계산
  const ruleResults = VALIDATION_RULES.map((rule) => ({
    ...rule,
    passed: rule.check(value),
  }));

  // 아이디 중복확인 결과를 규칙 배열에 추가
  const duplicateCheckResult = {
    label: "아이디 중복확인",
    passed: isDuplicate === false,
  };

  // 모든 검증 결과 통합 (기본 규칙 + 중복확인)
  const allValidationResults = [...ruleResults, duplicateCheckResult];

  // 모든 규칙 통과 여부
  const allRulesPassed = ruleResults.every((r) => r.passed) && hasValue;

  // 중복 확인 - 포커싱되었을 때 실행
  useEffect(() => {
    const checkDuplicate = async () => {
      // 포커스 상태가 아니면 실행하지 않음
      if (!isFocused) {
        return;
      }

      // 모든 규칙을 통과하지 않으면 중복 확인하지 않음
      if (!allRulesPassed || !onDuplicateCheck) {
        setIsDuplicate(null);
        setHasDuplicateCheck(false);
        return;
      }

      try {
        const result = await onDuplicateCheck(value);
        setIsDuplicate(result);
        setHasDuplicateCheck(true);
      } catch (error) {
        console.error("중복 확인 중 오류:", error);
        setIsDuplicate(null);
        setHasDuplicateCheck(false);
      }
    };

    // 입력이 멈춘 후 500ms 후에 중복 확인 실행 (디바운스)
    const timer = setTimeout(() => {
      checkDuplicate();
    }, 500);

    return () => clearTimeout(timer);
  }, [value, allRulesPassed, isFocused, onDuplicateCheck]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    field.onBlur();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // 영문 대소문자와 숫자만 허용하고, 나머지 문자 제거
    const sanitized = inputValue.replace(/[^a-zA-Z0-9]/g, "");

    // 소문자로 변환
    const lowercased = sanitized.toLowerCase();

    // 값이 변경된 경우에만 업데이트 (불필요한 리렌더링 방지)
    if (lowercased !== value) {
      field.onChange(lowercased);
      // 값이 변경되면 중복 확인 결과 초기화
      setIsDuplicate(null);
      setHasDuplicateCheck(false);
    }
  };

  const handleClear = () => {
    field.onChange("");
    setIsDuplicate(null);
    setHasDuplicateCheck(false);
  };

  // 입력 필드 border와 라벨 색상 결정
  const getInputState = () => {
    // react-hook-form 에러가 있으면 항상 error
    if (error) return "error";

    // 포커스 Out 상태에서만 검증 결과 반영
    if (!isFocused && hasValue) {
      // 모든 규칙 통과 + 중복 아님 = success
      if (allRulesPassed && isDuplicate === false) {
        return "success";
      }

      // 규칙 실패 또는 중복 = error
      if (!allRulesPassed || isDuplicate === true) {
        return "error";
      }
    }

    // 포커스 In 상태에서는 값이 있으면 danger
    if (isFocused && hasValue) {
      return "error";
    }

    return undefined;
  };

  const inputState = getInputState();

  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper}>
        {label && (
          <label
            className={`${styles.label} ${
              inputState === "success"
                ? styles.focused
                : inputState === "error"
                  ? styles.error
                  : ""
            }`}
          >
            {label}
          </label>
        )}

        <input
          ref={field.ref}
          name={field.name}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          autoComplete="username"
          className={`${styles.input} ${isFocused ? styles.focused : ""}`}
          style={{
            borderColor:
              inputState === "success"
                ? "var(--success)"
                : inputState === "error"
                  ? "var(--danger)"
                  : undefined,
          }}
        />

        {hasValue && (
          <ClearIcon className={styles.clearButton} onClick={handleClear} />
        )}
      </div>

      {/* 헬퍼 텍스트 */}
      <div className={styles.helperContainer}>
        {/* 포커스 In: 기본 안내 문구 표시 (중립 색상) */}
        {isFocused && (
          <p className={styles.helperTextNeutral}>
            영문 소문자, 숫자, 10-15자, 아이디 중복확인
          </p>
        )}

        {/* 포커스 Out: 검증 결과 표시 */}
        {!isFocused && hasValue && (
          <div className={styles.helperTextContainer}>
            {allValidationResults.map((rule, index) => (
              <p
                key={index}
                className={
                  rule.passed
                    ? styles.helperTextSuccess
                    : styles.helperTextError
                }
              >
                {rule.label}
                {index < allValidationResults.length - 1 && ", "}
              </p>
            ))}
          </div>
        )}

        {/* react-hook-form 에러 메시지 */}
        {error && <p className={styles.helperTextError}>{error.message}</p>}
      </div>
    </div>
  );
}
