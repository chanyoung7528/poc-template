"use client";

import { useState, useEffect } from "react";
import type { Control, FieldValues, Path } from "react-hook-form";
import { useController } from "react-hook-form";
import { ClearIcon } from "@/shared/ui/icon/ClearIcon";
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
    label: "영문 소문자 포함",
    check: (value: string) => /[a-z]/.test(value) && /^[a-z0-9]*$/.test(value),
  },
  {
    label: "숫자 포함",
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
  const [isTouched, setIsTouched] = useState(false);
  const [isDuplicateChecking, setIsDuplicateChecking] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState<boolean | null>(null);

  const value = field.value ?? "";
  const hasValue = String(value).length > 0;

  // 각 규칙의 통과 여부 계산
  const ruleResults = VALIDATION_RULES.map((rule) => ({
    ...rule,
    passed: rule.check(value),
  }));

  // 모든 규칙 통과 여부
  const allRulesPassed = ruleResults.every((r) => r.passed) && hasValue;

  // 중복 확인 자동 실행
  useEffect(() => {
    const checkDuplicate = async () => {
      if (!allRulesPassed || !onDuplicateCheck || !isTouched) {
        setIsDuplicate(null);
        return;
      }

      setIsDuplicateChecking(true);
      try {
        const result = await onDuplicateCheck(value);
        setIsDuplicate(result);
      } catch (error) {
        console.error("중복 확인 중 오류:", error);
        setIsDuplicate(null);
      } finally {
        setIsDuplicateChecking(false);
      }
    };

    // 입력이 멈춘 후 500ms 후에 중복 확인 실행 (디바운스)
    const timer = setTimeout(() => {
      checkDuplicate();
    }, 500);

    return () => clearTimeout(timer);
  }, [value, allRulesPassed, isTouched, onDuplicateCheck]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setIsTouched(true);
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
    }
  };

  const handleClear = () => {
    field.onChange("");
    setIsTouched(false);
    setIsDuplicate(null);
  };

  // 입력 필드 border와 라벨 색상 결정 (동일한 시점)
  const getInputState = () => {
    if (!isTouched) return undefined;
    if (error) return "error";
    if (isDuplicate === true) return "error";
    if (isDuplicate === false && allRulesPassed) return "success";
    return undefined;
  };

  // 라벨 색상, 인풋색상 모두 동일로직을 사용
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
        {/* 포커스 In: 기본 안내 문구 (중립 색상) */}
        {isFocused && !isTouched && (
          <p className={styles.helperTextNeutral}>
            영문 소문자, 숫자, 10-15자
          </p>
        )}

        {/* 포커스 Out: 검증 결과 표시 */}
        {isTouched && !isFocused && (
          <>
            {ruleResults.map((rule, index) => (
              <p
                key={index}
                className={
                  rule.passed
                    ? styles.helperTextSuccess
                    : styles.helperTextError
                }
              >
                {rule.label}
              </p>
            ))}

            {/* 중복 확인 결과 */}
            {isDuplicateChecking && allRulesPassed && (
              <p className={styles.helperTextNeutral}>중복 확인 중...</p>
            )}
            {isDuplicate === true && allRulesPassed && (
              <p className={styles.helperTextError}>
                이미 사용중인 아이디입니다.
              </p>
            )}
            {isDuplicate === false && allRulesPassed && (
              <p className={styles.helperTextSuccess}>
                사용 가능한 아이디입니다.
              </p>
            )}
          </>
        )}

        {/* react-hook-form 에러 메시지 */}
        {error && isTouched && (
          <p className={styles.helperTextError}>{error.message}</p>
        )}
      </div>
    </div>
  );
}
