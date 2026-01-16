import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * 인증 Provider 타입
 */
export type AuthProvider = "kakao" | "naver" | "apple" | "wellness";

/**
 * 회원가입 진행 단계
 */
export type SignupStep =
  | "idle" // 시작 전
  | "terms" // 약관 동의
  | "verification" // 본인인증
  | "credentials" // ID/PW 입력 (wellness only)
  | "completed"; // 완료

/**
 * 사용자 인증 상태
 */
export interface AuthState {
  // 사용자 정보
  userId: string | null;
  provider: AuthProvider | null;
  isAuthenticated: boolean;

  // 회원가입 진행 상태
  isTemp: boolean; // 임시 세션 여부
  signupStep: SignupStep;
  termsAgreed: boolean;
  verified: boolean;

  // 본인인증 데이터 (임시 저장)
  verificationData: {
    name?: string;
    phone?: string;
    birth?: string;
    gender?: "M" | "F";
  } | null;

  // 사용자 프로필
  email: string | null;
  nickname: string | null;
  profileImage: string | null;
}

/**
 * Auth Store Actions
 */
interface AuthActions {
  // 세션 초기화
  initSession: (sessionData: Partial<AuthState>) => void;

  // 로그인
  login: (userData: {
    userId: string;
    provider: AuthProvider;
    email?: string;
    nickname?: string;
    profileImage?: string;
  }) => void;

  // 로그아웃
  logout: () => void;

  // 회원가입 시작
  startSignup: (provider: AuthProvider) => void;

  // 약관 동의
  agreeToTerms: () => void;

  // 본인인증 완료
  completeVerification: (data: {
    name: string;
    phone: string;
    birth: string;
    gender: "M" | "F";
  }) => void;

  // 회원가입 단계 업데이트
  setSignupStep: (step: SignupStep) => void;

  // 회원가입 완료
  completeSignup: (userId: string) => void;

  // 상태 초기화
  reset: () => void;

  // Provider만 설정
  setProvider: (provider: AuthProvider) => void;
}

/**
 * 초기 상태
 */
const initialState: AuthState = {
  userId: null,
  provider: null,
  isAuthenticated: false,
  isTemp: false,
  signupStep: "idle",
  termsAgreed: false,
  verified: false,
  verificationData: null,
  email: null,
  nickname: null,
  profileImage: null,
};

/**
 * Auth Store
 *
 * 사용자 인증 상태 및 회원가입 진행 상태 관리
 * localStorage에 persist하여 새로고침 시에도 유지
 */
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      ...initialState,

      // 세션 초기화 (서버에서 세션 데이터 가져온 후)
      initSession: (sessionData) => {
        console.log("🔄 [Auth Store] 세션 초기화:", sessionData);
        set((state) => ({
          ...state,
          ...sessionData,
        }));
      },

      // 로그인
      login: (userData) => {
        console.log("✅ [Auth Store] 로그인:", userData);
        set({
          userId: userData.userId,
          provider: userData.provider,
          isAuthenticated: true,
          isTemp: false,
          signupStep: "completed",
          email: userData.email || null,
          nickname: userData.nickname || null,
          profileImage: userData.profileImage || null,
        });
      },

      // 로그아웃
      logout: () => {
        console.log("🚪 [Auth Store] 로그아웃");
        set(initialState);
      },

      // 회원가입 시작
      startSignup: (provider) => {
        console.log("🆕 [Auth Store] 회원가입 시작:", provider);
        set({
          provider,
          isTemp: true,
          signupStep: "terms",
          isAuthenticated: false,
        });
      },

      // 약관 동의
      agreeToTerms: () => {
        console.log("📋 [Auth Store] 약관 동의 완료");
        set({
          termsAgreed: true,
          signupStep: "verification",
        });
      },

      // 본인인증 완료
      completeVerification: (data) => {
        console.log("✅ [Auth Store] 본인인증 완료:", data);
        set((state) => ({
          verified: true,
          verificationData: data,
          signupStep:
            state.provider === "wellness" ? "credentials" : "completed",
        }));
      },

      // 회원가입 단계 업데이트
      setSignupStep: (step) => {
        console.log("📍 [Auth Store] 단계 업데이트:", step);
        set({ signupStep: step });
      },

      // 회원가입 완료
      completeSignup: (userId) => {
        console.log("🎉 [Auth Store] 회원가입 완료:", userId);
        set({
          userId,
          isAuthenticated: true,
          isTemp: false,
          signupStep: "completed",
        });
      },

      // 상태 초기화
      reset: () => {
        console.log("🔄 [Auth Store] 상태 초기화");
        set(initialState);
      },

      // Provider만 설정
      setProvider: (provider) => {
        console.log("🔧 [Auth Store] Provider 설정:", provider);
        set({ provider });
      },
    }),
    {
      name: "auth-storage", // localStorage key
      storage: createJSONStorage(() => localStorage),
      // 민감한 정보는 제외하고 저장
      partialize: (state) => ({
        provider: state.provider,
        signupStep: state.signupStep,
        termsAgreed: state.termsAgreed,
        verified: state.verified,
        isTemp: state.isTemp,
        // verificationData는 저장하지 않음 (보안)
        // userId, email 등도 세션에서만 관리
      }),
    }
  )
);

/**
 * Auth Store Selectors (성능 최적화)
 */
export const useAuthUser = () =>
  useAuthStore((state) => ({
    userId: state.userId,
    email: state.email,
    nickname: state.nickname,
    profileImage: state.profileImage,
  }));

export const useAuthStatus = () =>
  useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    isTemp: state.isTemp,
    provider: state.provider,
  }));

export const useSignupProgress = () =>
  useAuthStore((state) => ({
    signupStep: state.signupStep,
    termsAgreed: state.termsAgreed,
    verified: state.verified,
    provider: state.provider,
  }));
