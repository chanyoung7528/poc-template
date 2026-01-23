export type AuthEvent = 'refresh-failed';

export interface AuthEventPayload {
  error?: unknown;
}

type AuthEventListener = (event: AuthEvent, payload?: AuthEventPayload) => void;

const listeners = new Set<AuthEventListener>();

export const authEvents = {
  subscribe(listener: AuthEventListener) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  emit(event: AuthEvent, payload?: AuthEventPayload) {
    listeners.forEach(listener => listener(event, payload));
  },
} as const;
