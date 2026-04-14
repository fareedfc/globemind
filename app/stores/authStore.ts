import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { pullAll } from '../lib/sync';
import { setCurrentUserId } from '../lib/userId';
import { usePlayerStore } from './playerStore';
import { useProgressStore } from './progressStore';
import { useBrainStore } from './brainStore';

interface AuthState {
  isLoggedIn: boolean;
  userId:     string | null;
  email:      string | null;
  name:       string | null;

  signUp:      (name: string, email: string, password: string) => Promise<{ error?: string; needsConfirmation?: boolean }>;
  login:       (email: string, password: string)               => Promise<{ error?: string }>;
  resendConfirmation: (email: string)                          => Promise<{ error?: string }>;
  resetPassword:      (email: string)                          => Promise<{ error?: string }>;
  updatePassword:     (newPassword: string)                    => Promise<{ error?: string }>;
  logout:      () => Promise<void>;
  initSession: () => Promise<void>;
}

function hydrateStores(data: Awaited<ReturnType<typeof pullAll>>) {
  const { profile, completions, brain } = data;

  if (profile) {
    const p = profile as Record<string, unknown>;
    usePlayerStore.setState({
      score:             p.score             as number,
      lives:             p.lives             as number,
      streak:            p.streak            as number,
      lastPlayedDate:    (p.last_played      as string  | null) ?? null,
      nextRefillAt:      (p.next_refill_at   as number  | null) ?? null,
      isPremium:         p.is_premium        as boolean,
      dailyLevelsPlayed: p.daily_count       as number,
      dailyLevelsDate:   (p.daily_date       as string  | null) ?? null,
    });
    useProgressStore.setState({ currentLevelId: p.current_level as number });
  }

  if (completions.length > 0) {
    const map: Record<number, number> = {};
    completions.forEach(c => { map[c.level_id] = c.stars; });
    useProgressStore.setState({ completions: map });
  }

  if (brain) {
    const b = brain as Record<string, unknown>;
    useBrainStore.setState({
      domains: {
        memory:  b.memory  as number,
        logic:   b.logic   as number,
        speed:   b.speed   as number,
        pattern: b.pattern as number,
      },
      weeklyBaseline: b.weekly_baseline as number,
      weekStart:      (b.week_start as string) ?? '',
    });
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      userId:     null,
      email:      null,
      name:       null,

      signUp: async (name, email, password) => {
        if (!name.trim())         return { error: 'Please enter your name.' };
        if (!email.includes('@')) return { error: 'Please enter a valid email.' };
        if (password.length < 6)  return { error: 'Password must be at least 6 characters.' };

        const { data, error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: { data: { name: name.trim() } },
        });

        if (error) {
          console.log('[signUp] Supabase error:', error.status, error.message);
          const msg = error.message.toLowerCase();
          if (msg.includes('already registered') || msg.includes('already exists'))
            return { error: 'An account with this email already exists. Try logging in instead.' };
          return { error: error.message };
        }
        if (!data.user)  return { error: 'Sign-up failed. Please try again.' };

        // If session is null, email confirmation is required before the user can log in
        if (!data.session) {
          return { needsConfirmation: true };
        }

        setCurrentUserId(data.user.id);
        set({ isLoggedIn: true, userId: data.user.id, email: data.user.email ?? email, name: name.trim() });
        return {};
      },

      login: async (email, password) => {
        if (!email.includes('@')) return { error: 'Please enter a valid email.' };
        if (!password)            return { error: 'Please enter your password.' };

        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) {
          if (error.message.toLowerCase().includes('email not confirmed')) {
            return { error: 'Please confirm your email first. Check your inbox for the link we sent.' };
          }
          return { error: error.message };
        }
        if (!data.user)  return { error: 'Login failed. Please try again.' };

        const user = data.user;
        setCurrentUserId(user.id);
        set({
          isLoggedIn: true,
          userId:     user.id,
          email:      user.email ?? email,
          name:       user.user_metadata?.name ?? null,
        });

        const pulled = await pullAll(user.id);
        hydrateStores(pulled);
        return {};
      },

      resendConfirmation: async (email) => {
        const { error } = await supabase.auth.resend({ type: 'signup', email });
        if (error) return { error: error.message };
        return {};
      },

      resetPassword: async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: 'thinkpop://reset',
        });
        if (error) return { error: error.message };
        return {};
      },

      updatePassword: async (newPassword) => {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) return { error: error.message };
        return {};
      },

      logout: async () => {
        await supabase.auth.signOut();
        setCurrentUserId(null);
        set({ isLoggedIn: false, userId: null, email: null, name: null });
      },

      initSession: async () => {
        const { data } = await supabase.auth.getSession();
        const user = data.session?.user;
        if (!user) return;

        setCurrentUserId(user.id);
        set({
          isLoggedIn: true,
          userId:     user.id,
          email:      user.email ?? null,
          name:       user.user_metadata?.name ?? null,
        });

        const pulled = await pullAll(user.id);
        hydrateStores(pulled);
      },
    }),
    {
      name: 'thinkpop-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        isLoggedIn: s.isLoggedIn,
        userId:     s.userId,
        email:      s.email,
        name:       s.name,
      }),
    },
  ),
);
