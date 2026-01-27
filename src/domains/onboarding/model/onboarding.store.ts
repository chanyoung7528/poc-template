import { create } from "zustand";

import type {
  OnboardingFormData,
  OnboardingStep,
} from "../model/onboarding.types";

interface JoinStore {
  formData: OnboardingFormData;
  currentStep: OnboardingStep;
  historyStack: OnboardingStep[];
  previousProgress: number; // 이전 프로그레스 값 저장

  // Actions
  setFormData: (data: Partial<OnboardingFormData>) => void;
  setOnboardingData: (data: Partial<OnboardingFormData>) => void;
  goToStep: (step: OnboardingStep) => void;
  goBack: () => OnboardingStep | null;
  resetForm: () => void;
  canGoBack: () => boolean;
  setPreviousProgress: (progress: number) => void; // 프로그레스 저장 함수
}

const initialFormData: OnboardingFormData = {
  groupInfo: [],
  allergies: [],
  gender: "",
  lifestyle: [],
  isCompleted: false,
};

export const useOnboardingStore = create<JoinStore>((set, get) => ({
  formData: initialFormData,
  currentStep: "onboarding-group",
  historyStack: [],
  previousProgress: 0,

  setFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),

  setOnboardingData: (data) =>
    set((state) => ({
      formData: {
        ...state.formData,
        ...data,
      },
    })),

  goToStep: (step) =>
    set((state) => ({
      currentStep: step,
      historyStack: [...state.historyStack, state.currentStep],
    })),

  goBack: (): OnboardingStep | null => {
    const { historyStack } = get();
    if (historyStack.length === 0) return null;

    const previousStep = historyStack[historyStack.length - 1];
    if (!previousStep) return null;

    set({
      currentStep: previousStep,
      historyStack: historyStack.slice(0, -1),
    });

    return previousStep;
  },

  canGoBack: () => {
    const { historyStack } = get();
    return historyStack.length > 0;
  },

  setPreviousProgress: (progress) => set({ previousProgress: progress }),

  resetForm: () =>
    set({
      formData: initialFormData,
      currentStep: "onboarding-group",
      historyStack: [],
      previousProgress: 0,
    }),
}));
