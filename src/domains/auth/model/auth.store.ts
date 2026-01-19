import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, TempToken, AuthStatus } from './auth.types';

interface AuthStore {
  // State
  user: User | null;
  tempToken: TempToken | null;
  authStatus: AuthStatus;

  // Actions
  setUser: (user: User | null) => void;
  setTempToken: (token: TempToken | null) => void;
  setAuthStatus: (status: AuthStatus) => void;
  clearAuth: () => void;

  // Computed
  isAuthenticated: () => boolean;
  isTempTokenValid: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      tempToken: null,
      authStatus: 'idle',

      // Actions
      setUser: (user) =>
        set({ user, authStatus: user ? 'authenticated' : 'unauthenticated' }),

      setTempToken: (token) => set({ tempToken: token }),

      setAuthStatus: (status) => set({ authStatus: status }),

      clearAuth: () =>
        set({
          user: null,
          tempToken: null,
          authStatus: 'unauthenticated',
        }),

      // Computed
      isAuthenticated: () => {
        const { user } = get();
        return !!user;
      },

      isTempTokenValid: () => {
        const { tempToken } = get();
        if (!tempToken) return false;
        return Date.now() < tempToken.expiresAt;
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        authStatus: state.authStatus,
      }),
    }
  )
);
