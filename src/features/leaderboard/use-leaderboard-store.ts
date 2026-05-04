import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RoundResult } from '@/features/round/types';
import type { LeaderboardEntry } from './types';
import { isRemoteLeaderboardEnabled } from '@/lib/env';
import { getSupabase } from '@/lib/supabase';
import { insertRoundResultRemote } from '@/features/leaderboard/supabase-leaderboard';

interface Player {
  id: string;
  displayName: string;
  createdAt: number;
}

interface LeaderboardState {
  player: Player | null;
  results: RoundResult[];
  setPlayer: (displayName: string) => Player;
  addResult: (
    result: Omit<RoundResult, 'id' | 'createdAt' | 'playerId' | 'playerName'>,
  ) => Promise<RoundResult>;
  getResultById: (id: string) => RoundResult | undefined;
  reset: () => void;
}

const generateId = () => Math.random().toString(36).slice(2, 11);

function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return generateId();
}

export const useLeaderboardStore = create<LeaderboardState>()(
  persist(
    (set, get) => ({
      player: null,
      results: [],
      setPlayer: (displayName) => {
        const trimmed = displayName.trim();
        const existing = get().player;
        if (existing && existing.displayName === trimmed) return existing;
        const player: Player = existing
          ? { ...existing, displayName: trimmed }
          : {
              id: newId(),
              displayName: trimmed,
              createdAt: Date.now(),
            };
        set({ player });
        return player;
      },
      addResult: async (partial) => {
        const player = get().player;
        if (!player) {
          throw new Error('Cannot record a result without a player');
        }
        if (isRemoteLeaderboardEnabled()) {
          const sb = getSupabase();
          if (!sb) {
            throw new Error('Supabase is enabled in env but client failed to init');
          }
          const result = await insertRoundResultRemote(sb, {
            ...partial,
            playerId: player.id,
            playerName: player.displayName,
          });
          set((s) => ({ results: [result, ...s.results] }));
          return result;
        }
        const result: RoundResult = {
          ...partial,
          id: newId(),
          playerId: player.id,
          playerName: player.displayName,
          createdAt: Date.now(),
        };
        set((s) => ({ results: [result, ...s.results] }));
        return result;
      },
      getResultById: (id) => get().results.find((r) => r.id === id),
      reset: () => set({ player: null, results: [] }),
    }),
    {
      name: 'trollfaces.leaderboard',
      version: 1,
      partialize: (state) => ({
        player: state.player,
        results: state.results,
      }),
    },
  ),
);

export type { LeaderboardEntry } from './types';

/**
 * Aggregate raw results into a sorted leaderboard.
 * Sort:
 *   1. total points (desc)
 *   2. best single-round score (desc)
 *   3. earliest achievement (asc)
 */
export function buildLeaderboard(results: RoundResult[]): LeaderboardEntry[] {
  const byPlayer = new Map<string, LeaderboardEntry>();
  results.forEach((r) => {
    const existing = byPlayer.get(r.playerId);
    if (!existing) {
      byPlayer.set(r.playerId, {
        playerId: r.playerId,
        playerName: r.playerName,
        totalPoints: r.pointsAwarded,
        bestScore: r.score,
        rounds: 1,
        earliestAchievedAt: r.createdAt,
      });
      return;
    }
    existing.totalPoints += r.pointsAwarded;
    existing.bestScore = Math.max(existing.bestScore, r.score);
    existing.rounds += 1;
    existing.earliestAchievedAt = Math.min(
      existing.earliestAchievedAt,
      r.createdAt,
    );
    existing.playerName = r.playerName;
  });
  return [...byPlayer.values()].sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
    return a.earliestAchievedAt - b.earliestAchievedAt;
  });
}
