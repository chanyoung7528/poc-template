/**
 * Domain: Member - Store
 *
 * 역할: 회원가입/로그인 상태 관리 (Facts Only)
 * - 약관 동의 데이터
 * - 토큰 (verificationToken, registerToken, linkToken)
 * - 회원가입 폼 데이터
 */

import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type {
  Member,
  VerificationToken,
  RegisterToken,
  LinkToken,
  Agreement,
  GeneralSignupData,
  SnsSignupData,
} from "./member.types";

interface MemberStore {
  // ============================================
  // 회원 정보
  // ============================================
  member: Member | null;
  setMember: (member: Member | null) => void;

  // ============================================
  // 일반 회원가입 데이터
  // ============================================
  generalSignupData: Partial<GeneralSignupData>;

  // 약관 동의 저장
  setAgreements: (agreements: Agreement[]) => void;

  // 본인인증 후 토큰 저장
  setVerificationToken: (token: string) => void;

  // 회원가입 폼 데이터 저장
  setCredentials: (loginId: string, password: string) => void;

  // 추가 정보 저장
  setAdditionalInfo: (info: {
    hegtVal?: number;
    wegtVal?: number;
    actAmountCd?: string;
  }) => void;

  // 회원가입 데이터 초기화
  clearGeneralSignupData: () => void;

  // ============================================
  // SNS 회원가입 데이터
  // ============================================
  snsSignupData: Partial<SnsSignupData>;

  // SNS 정보 저장
  setSnsInfo: (
    snsType: "KAKAO" | "NAVER" | "APPLE",
    accessToken: string
  ) => void;

  // 약관 동의 저장 (SNS)
  setSnsAgreements: (agreements: Agreement[]) => void;

  // SNS 회원가입 토큰 저장
  setRegisterToken: (token: string) => void;

  // 본인인증 transactionId 저장
  setTransactionId: (transactionId: string) => void;

  // SNS 회원가입 데이터 초기화
  clearSnsSignupData: () => void;

  // ============================================
  // 토큰 관리 (FE에서 관리하는 임시 토큰)
  // ============================================
  verificationToken: VerificationToken | null;
  registerToken: RegisterToken | null;
  linkToken: LinkToken | null;

  // 토큰 만료 확인
  isVerificationTokenValid: () => boolean;
  isRegisterTokenValid: () => boolean;
  isLinkTokenValid: () => boolean;
}

const initialGeneralSignupData: GeneralSignupData = {
  agreements: [],
  verificationToken: "",
  loginId: "",
  password: "",
  hegtVal: 175.5,
  wegtVal: 70.5,
  actAmountCd: "NORMAL",
  pushTknCont:
    "fKjHG8d9ZxC:APA91bFZjY4xQDm5xK7Nn3eVp2hRtWq8sL1uM9vB3cN7oP0qR5tY6wX2zA8",
  dvcId: "550e8400-e29b-41d4-a716-446655440000",
  dvcTpCd: "AND",
  dvcMdlNm: "SM-G991N",
  osVerNm: "13",
  appVerNm: "1.0.0",
  // hegtVal: undefined,
  // wegtVal: undefined,
  // actAmountCd: "",
  // pushTknCont: "",
  // dvcId: "",
  // dvcTpCd: "",
  // dvcMdlNm: "",
  // osVerNm: "",
  // appVerNm: "",
};

const initialSnsSignupData: Partial<SnsSignupData> = {
  snsType: undefined,
  accessToken: "",
  agreements: [],
  registerToken: "",
  transactionId: "",
  hegtVal: undefined,
  wegtVal: undefined,
  actAmountCd: "",
};

export const useMemberStore = create<MemberStore>()(
  devtools(
    persist(
      (set, get) => ({
      // ============================================
      // 회원 정보
      // ============================================
      member: null,
      setMember: (member) => set({ member }),

      // ============================================
      // 일반 회원가입 데이터
      // ============================================
      generalSignupData: initialGeneralSignupData,

      setAgreements: (agreements) =>
        set((state) => ({
          generalSignupData: {
            ...state.generalSignupData,
            agreements,
          },
        })),

      setVerificationToken: (token) =>
        set((state) => ({
          generalSignupData: {
            ...state.generalSignupData,
            verificationToken: token,
          },
          verificationToken: {
            token,
            expiresAt: Date.now() + 15 * 60 * 1000, // 15분
          },
        })),

      setCredentials: (loginId, password) =>
        set((state) => ({
          generalSignupData: {
            ...state.generalSignupData,
            loginId,
            password,
          },
        })),

      setAdditionalInfo: (info) =>
        set((state) => ({
          generalSignupData: {
            ...state.generalSignupData,
            ...info,
          },
        })),

      clearGeneralSignupData: () =>
        set({
          generalSignupData: initialGeneralSignupData,
          verificationToken: null,
        }),

      // ============================================
      // SNS 회원가입 데이터
      // ============================================
      snsSignupData: initialSnsSignupData,

      setSnsInfo: (snsType, accessToken) =>
        set((state) => ({
          snsSignupData: {
            ...state.snsSignupData,
            snsType,
            accessToken,
          },
        })),

      setSnsAgreements: (agreements) =>
        set((state) => ({
          snsSignupData: {
            ...state.snsSignupData,
            agreements,
          },
        })),

      setRegisterToken: (token) =>
        set((state) => ({
          snsSignupData: {
            ...state.snsSignupData,
            registerToken: token,
          },
          registerToken: {
            token,
            expiresAt: Date.now() + 5 * 60 * 1000, // 5분
          },
        })),

      setTransactionId: (transactionId) =>
        set((state) => ({
          snsSignupData: {
            ...state.snsSignupData,
            transactionId,
          },
        })),

      clearSnsSignupData: () =>
        set({
          snsSignupData: initialSnsSignupData,
          registerToken: null,
        }),

      // ============================================
      // 토큰 관리
      // ============================================
      verificationToken: null,
      registerToken: null,
      linkToken: null,

      isVerificationTokenValid: () => {
        const token = get().verificationToken;
        return token !== null && Date.now() < token.expiresAt;
      },

      isRegisterTokenValid: () => {
        const token = get().registerToken;
        return token !== null && Date.now() < token.expiresAt;
      },

      isLinkTokenValid: () => {
        const token = get().linkToken;
        return token !== null && Date.now() < token.expiresAt;
      },
      }),
      {
        name: "member-storage",
        // 세션 스토리지 사용 (브라우저 탭 닫으면 삭제)
        storage: {
          getItem: (name: string) => {
            const str = sessionStorage.getItem(name);
            return str ? JSON.parse(str) : null;
          },
          setItem: (name: string, value: any) => {
            sessionStorage.setItem(name, JSON.stringify(value));
          },
          removeItem: (name: string) => {
            sessionStorage.removeItem(name);
          },
        },
        // agreements만 persist (토큰은 보안상 persist하지 않음)
        partialize: (state) => ({
          generalSignupData: {
            ...state.generalSignupData,
            // agreements만 유지, 나머지는 초기값 사용
            agreements: state.generalSignupData.agreements || [],
            verificationToken: undefined,
            loginId: undefined,
            password: undefined,
          },
          snsSignupData: {
            ...state.snsSignupData,
            // agreements만 유지, 나머지는 초기값 사용
            agreements: state.snsSignupData.agreements || [],
            accessToken: undefined,
            registerToken: undefined,
            transactionId: undefined,
          },
        }),
      }
    ),
    { name: "MemberStore" }
  )
);
