'use client';

import { forwardRef, useState, useImperativeHandle, useRef } from 'react';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { useController } from 'react-hook-form';
import { ClearIcon } from '@/shared/ui/icon/ClearIcon';
import styles from './FormInput.module.scss';

interface FormInputProps<T extends FieldValues = FieldValues> extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'name' | 'onChange' | 'onBlur' | 'onFocus'
> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  error?: string | boolean;
  helperText?: string;
  showClearButton?: boolean;
  children?: React.ReactNode;
  // 폼 라이브러리 외부에서 추가 로직을 실행하고 싶을 때를 위한 콜백
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
  onFocus?: (value: string) => void;
  onClear?: () => void;
}

const FormInputComponent = <T extends FieldValues = FieldValues>(
  {
    name,
    control,
    label,
    error: errorProp,
    helperText,
    showClearButton = true,
    onClear: onClearProp,
    className,
    value: valueProp,
    onChange: onChangeProp,
    onBlur: onBlurProp,
    onFocus: onFocusProp,
    children,
    ...props
  }: FormInputProps<T>,
  ref: React.Ref<HTMLInputElement>
) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // forwardRef로 들어온 ref와 내부 inputRef 연결
  useImperativeHandle(ref, () => inputRef.current!);

  const {
    field,
    fieldState: { error: fieldError },
  } = useController({ name, control });

  // 1. 에러 로직 우선순위 정리
  const errorMessage =
    typeof errorProp === 'string' ? errorProp : fieldError?.message;
  const hasError = !!errorProp || !!fieldError;

  // 2. 값 로직 정리 (Controlled/Uncontrolled 대응)
  const value = valueProp ?? field.value ?? '';
  const hasValue = String(value).length > 0;

  // 3. 입력 상태 결정 (에러/성공/기본)
  const getInputState = () => {
    if (!isTouched) return undefined;
    if (hasError) return 'error';
    if (hasValue && !hasError) return 'success';
    return undefined;
  };

  const inputState = getInputState();

  // 4. 이벤트 핸들러 통합
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    field.onChange(e); // react-hook-form 업데이트
    onChangeProp?.(e.target.value); // 외부 콜백 실행
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    field.onBlur();
    onBlurProp?.(e.target.value);
    setIsFocused(false);
    setIsTouched(true);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocusProp?.(e.target.value);
  };

  const handleClear = () => {
    if (onClearProp) {
      onClearProp();
    } else {
      field.onChange(''); // RHF 값 초기화
      onChangeProp?.('');
    }
    setIsTouched(false); // Clear 시 상태 초기화
  };

  // Clear 버튼 노출 조건 검사
  const shouldShowClear =
    showClearButton &&
    hasValue &&
    !props.disabled &&
    !props.readOnly &&
    !children;

  return (
    <div className={styles.container}>
      <div
        className={`${styles.inputWrapper} ${children ? styles.hasAction : ''}`}
      >
        {label && (
          <label
            className={`${styles.label} ${inputState === 'success' ? styles.focused : inputState === 'error' ? styles.error : isFocused ? styles.focused : ''}`}
          >
            {label}
          </label>
        )}

        <input
          {...props} // 커스텀 속성을 앞에 배치
          ref={inputRef}
          name={field.name}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`${styles.input} 
            ${isFocused ? styles.focused : ''} 
            ${children ? styles.hasActionButton : ''} 
            ${className || ''}`}
          style={{
            borderColor:
              inputState === 'success'
                ? 'var(--success)'
                : inputState === 'error'
                  ? 'var(--danger)'
                  : undefined,
          }}
        />

        {children ||
          (shouldShowClear && (
            <ClearIcon className={styles.clearButton} onClick={handleClear} />
          ))}
      </div>

      {(errorMessage || helperText) && (
        <span className={hasError ? styles.errorMessage : styles.helperText}>
          {errorMessage || helperText}
        </span>
      )}
    </div>
  );
};

// 고차 컴포넌트(HOC) 타입 추론을 위한 내보내기 방식
export const FormInput = forwardRef(FormInputComponent) as <
  T extends FieldValues = FieldValues,
>(
  props: FormInputProps<T> & { ref?: React.Ref<HTMLInputElement> }
) => React.ReactElement;
