import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  User,
  AuthStatus,
  VerificationToken,
  RegisterToken,
  LinkToken,
} from './auth.types';

interface AuthStore {
  // State
  user: User | null;
  authStatus: AuthStatus;

  // 토큰 관리 (서버에서 발급받는 임시 토큰들)
  verificationToken: VerificationToken | null; // 본인인증 토큰 (15분)
  registerToken: RegisterToken | null; // SNS 회원가입 토큰 (5분)
  linkToken: LinkToken | null; // 계정 연동 토큰 (5분)

  // Actions
  setUser: (user: User | null) => void;
  setAuthStatus: (status: AuthStatus) => void;
  setVerificationToken: (token: VerificationToken | null) => void;
  setRegisterToken: (token: RegisterToken | null) => void;
  setLinkToken: (token: LinkToken | null) => void;
  clearAuth: () => void;
  clearTokens: () => void;

  // Computed
  isAuthenticated: () => boolean;
  isVerificationTokenValid: () => boolean;
  isRegisterTokenValid: () => boolean;
  isLinkTokenValid: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      authStatus: 'idle',
      verificationToken: null,
      registerToken: null,
      linkToken: null,

      // Actions
      setUser: (user) =>
        set({ user, authStatus: user ? 'authenticated' : 'unauthenticated' }),

      setAuthStatus: (status) => set({ authStatus: status }),

      setVerificationToken: (token) => set({ verificationToken: token }),

      setRegisterToken: (token) => set({ registerToken: token }),

      setLinkToken: (token) => set({ linkToken: token }),

      clearAuth: () =>
        set({
          user: null,
          authStatus: 'unauthenticated',
          verificationToken: null,
          registerToken: null,
          linkToken: null,
        }),

      clearTokens: () =>
        set({
          verificationToken: null,
          registerToken: null,
          linkToken: null,
        }),

      // Computed
      isAuthenticated: () => {
        const { user } = get();
        return !!user;
      },

      isVerificationTokenValid: () => {
        const { verificationToken } = get();
        if (!verificationToken) return false;
        return Date.now() < verificationToken.expiresAt;
      },

      isRegisterTokenValid: () => {
        const { registerToken } = get();
        if (!registerToken) return false;
        return Date.now() < registerToken.expiresAt;
      },

      isLinkTokenValid: () => {
        const { linkToken } = get();
        if (!linkToken) return false;
        return Date.now() < linkToken.expiresAt;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        authStatus: state.authStatus,
        // 토큰들은 persist 하지 않음 (보안상 이유 + 단기 토큰)
      }),
    }
  )
);
