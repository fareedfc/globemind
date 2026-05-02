/**
 * Pure Supabase I/O — no store imports.
 *
 * Push functions accept data directly from the calling store.
 * pullAll returns raw DB rows; authStore is responsible for hydrating stores.
 */

import { supabase } from './supabase';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PlayerSyncData {
  score:          number;
  lives:          number;
  streak:         number;
  lastPlayedDate: string | null;
  nextRefillAt:   number | null;
  isPremium:      boolean;
  dailyCount:     number;
  dailyDate:      string | null;
}

export interface BrainSyncData {
  memory:         number;
  logic:          number;
  speed:          number;
  pattern:        number;
  weeklyBaseline: number;
  weekStart:      string;
}

export interface PullResult {
  profile:     Record<string, unknown> | null;
  completions: { world_id: number; level_id: number; stars: number }[];
  brain:       Record<string, unknown> | null;
}

// ─── Pull ─────────────────────────────────────────────────────────────────────

export async function pullAll(userId: string): Promise<PullResult> {
  const [profileRes, completionsRes, brainRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('level_completions').select('world_id, level_id, stars').eq('user_id', userId),
    supabase.from('brain_scores').select('*').eq('user_id', userId).single(),
  ]);

  return {
    profile:     profileRes.data    ?? null,
    completions: completionsRes.data ?? [],
    brain:       brainRes.data      ?? null,
  };
}

// ─── Push (fire-and-forget) ───────────────────────────────────────────────────

export function pushPlayerState(userId: string, data: PlayerSyncData): void {
  supabase.from('profiles').update({
    score:          data.score,
    lives:          data.lives,
    streak:         data.streak,
    last_played:    data.lastPlayedDate,
    next_refill_at: data.nextRefillAt,
    is_premium:     data.isPremium,
    daily_count:    data.dailyCount,
    daily_date:     data.dailyDate,
  }).eq('id', userId).then(() => {});
}

export function pushCurrentLevel(userId: string, currentLevel: number): void {
  supabase.from('profiles').update({ current_level: currentLevel })
    .eq('id', userId).then(() => {});
}

export function pushCompletion(userId: string, levelId: number, stars: number, worldId = 1): void {
  supabase.from('level_completions').upsert(
    { user_id: userId, world_id: worldId, level_id: levelId, stars },
    { onConflict: 'user_id,world_id,level_id' }
  ).then(() => {});
}

export function pushBrainState(userId: string, data: BrainSyncData): void {
  supabase.from('brain_scores').upsert(
    {
      user_id:         userId,
      memory:          data.memory,
      logic:           data.logic,
      speed:           data.speed,
      pattern:         data.pattern,
      weekly_baseline: data.weeklyBaseline,
      week_start:      data.weekStart,
    },
    { onConflict: 'user_id' }
  ).then(() => {});
}
