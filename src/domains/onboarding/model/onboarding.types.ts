export interface OnboardingFormData {
  groupInfo: string[]; // 그룹 정보
  allergies: string[]; // 알러지
  gender: "male" | "female" | "other" | "";
  lifestyle: string[]; // 생활패턴
  isCompleted: boolean;
}

export type OnboardingStep =
  | "onboarding-group" // 1. 그룹정보
  | "onboarding-allergy" // 2. 알러지
  | "onboarding-gender" // 3. 성별
  | "onboarding-lifestyle" // 4. 생활패턴
  | "onboarding-complete"; // 5. 온보딩완료

export const STEP_ROUTES: Record<OnboardingStep, string> = {
  "onboarding-group": "/join/onboarding/group",
  "onboarding-allergy": "/join/onboarding/allergy",
  "onboarding-gender": "/join/onboarding/gender",
  "onboarding-lifestyle": "/join/onboarding/lifestyle",
  "onboarding-complete": "/join/onboarding/complete",
};
