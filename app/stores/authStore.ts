import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// TODO: Replace login/signUp bodies with Supabase calls when backend is ready.
// The store shape stays the same — just swap the implementations.

interface AuthState {
  isLoggedIn: boolean;
  email: string | null;
  name: string | null;
  // local-only account store for prototype (single account per device)
  _storedEmail: string | null;
  _storedPasswordHash: string | null;
  _storedName: string | null;

  signUp: (name: string, email: string, password: string) => Promise<{ error?: string }>;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
}

// Simple deterministic hash — not crypto-secure, fine for local prototype
function simpleHash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return String(h);
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isLoggedIn: false,
      email: null,
      name: null,
      _storedEmail: null,
      _storedPasswordHash: null,
      _storedName: null,

      signUp: async (name, email, password) => {
        const trimEmail = email.trim().toLowerCase();
        const { _storedEmail } = get();

        if (!name.trim()) return { error: 'Please enter your name.' };
        if (!trimEmail.includes('@')) return { error: 'Please enter a valid email.' };
        if (password.length < 6) return { error: 'Password must be at least 6 characters.' };
        if (_storedEmail && _storedEmail !== trimEmail)
          return { error: 'An account already exists on this device. Log in instead.' };

        set({
          _storedEmail: trimEmail,
          _storedPasswordHash: simpleHash(password),
          _storedName: name.trim(),
          isLoggedIn: true,
          email: trimEmail,
          name: name.trim(),
        });
        return {};
      },

      login: async (email, password) => {
        const trimEmail = email.trim().toLowerCase();
        const { _storedEmail, _storedPasswordHash, _storedName } = get();

        if (!trimEmail.includes('@')) return { error: 'Please enter a valid email.' };
        if (!password) return { error: 'Please enter your password.' };
        if (!_storedEmail) return { error: 'No account found. Please sign up first.' };
        if (_storedEmail !== trimEmail) return { error: 'Email not recognised.' };
        if (_storedPasswordHash !== simpleHash(password)) return { error: 'Incorrect password.' };

        set({ isLoggedIn: true, email: trimEmail, name: _storedName });
        return {};
      },

      logout: () => set({ isLoggedIn: false, email: null, name: null }),
    }),
    {
      name: 'thinkpop-auth',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
