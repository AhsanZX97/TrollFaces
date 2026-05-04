import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RoundResult } from '@/features/round/types';

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
  ) => RoundResult;
  getResultById: (id: string) => RoundResult | undefined;
  reset: () => void;
}

const generateId = () => Math.random().toString(36).slice(2, 11);

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
              id: generateId(),
              displayName: trimmed,
              createdAt: Date.now(),
            };
        set({ player });
        return player;
      },
      addResult: (partial) => {
        const player = get().player;
        if (!player) {
          throw new Error('Cannot record a result without a player');
        }
        const result: RoundResult = {
          ...partial,
          id: generateId(),
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

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  totalPoints: number;
  bestScore: number;
  rounds: number;
  earliestAchievedAt: number;
}

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
