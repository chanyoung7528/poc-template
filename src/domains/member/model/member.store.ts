/**
 * Domain: Member - Store (Zustand)
 * 
 * 역할: 회원 상태 관리 (사실만)
 * - 비즈니스 규칙 금지
 * - 라우팅 금지
 * - 순수 상태만
 */

import { create } from "zustand";
import type {
  Member,
  VerificationTokenData,
  RegisterTokenData,
  LinkTokenData,
} from "./member.types";

interface MemberStore {
  // ============================================
  // 회원 정보
  // ============================================
  member: Member | null;
  setMember: (member: Member | null) => void;

  // ============================================
  // Verification Token (본인인증 완료)
  // ============================================
  verificationToken: VerificationTokenData | null;
  setVerificationToken: (token: VerificationTokenData | null) => void;
  clearVerificationToken: () => void;

  // ============================================
  // Register Token (SNS 간편가입)
  // ============================================
  registerToken: RegisterTokenData | null;
  setRegisterToken: (token: RegisterTokenData | null) => void;
  clearRegisterToken: () => void;

  // ============================================
  // Link Token (계정 연동)
  // ============================================
  linkToken: LinkTokenData | null;
  setLinkToken: (token: LinkTokenData | null) => void;
  clearLinkToken: () => void;

  // ============================================
  // 전체 초기화
  // ============================================
  clearAllTokens: () => void;
  clearAll: () => void;
}

export const useMemberStore = create<MemberStore>((set) => ({
  // ============================================
  // 초기 상태
  // ============================================
  member: null,
  verificationToken: null,
  registerToken: null,
  linkToken: null,

  // ============================================
  // 회원 정보
  // ============================================
  setMember: (member) => set({ member }),

  // ============================================
  // Verification Token
  // ============================================
  setVerificationToken: (token) => set({ verificationToken: token }),
  clearVerificationToken: () => set({ verificationToken: null }),

  // ============================================
  // Register Token
  // ============================================
  setRegisterToken: (token) => set({ registerToken: token }),
  clearRegisterToken: () => set({ registerToken: null }),

  // ============================================
  // Link Token
  // ============================================
  setLinkToken: (token) => set({ linkToken: token }),
  clearLinkToken: () => set({ linkToken: null }),

  // ============================================
  // 전체 초기화
  // ============================================
  clearAllTokens: () =>
    set({
      verificationToken: null,
      registerToken: null,
      linkToken: null,
    }),

  clearAll: () =>
    set({
      member: null,
      verificationToken: null,
      registerToken: null,
      linkToken: null,
    }),
}));
