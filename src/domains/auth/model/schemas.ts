import { z } from "zod";

/**
 * Wellness ID 검증 스키마
 * - 영문 소문자, 숫자만 허용
 * - 10-15자
 * - 영문 소문자 포함 필수
 * - 숫자 포함 필수
 */
export const wellnessIdSchema = z
  .string()
  .min(10, "")
  .max(15, "")
  .regex(/^[a-z0-9]+$/, "")
  .regex(/[a-z]/, "")
  .regex(/\d/, "");

/**
 * Wellness ID 검증 규칙 (UI 표시용)
 */
export interface WellnessIdValidationRule {
  label: string;
  check: (value: string) => boolean;
}

/**
 * Wellness ID 검증 규칙 배열
 * 스키마와 동일한 검증 로직을 UI 표시용으로 정의
 */
export const wellnessIdValidationRules: WellnessIdValidationRule[] = [
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
