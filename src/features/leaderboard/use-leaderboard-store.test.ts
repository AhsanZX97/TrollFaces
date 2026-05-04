import { beforeEach, describe, expect, it } from 'vitest';
import { buildLeaderboard, useLeaderboardStore } from './use-leaderboard-store';

describe('useLeaderboardStore', () => {
  beforeEach(() => {
    useLeaderboardStore.getState().reset();
    localStorage.clear();
  });

  it('creates a player on first setPlayer', () => {
    const player = useLeaderboardStore.getState().setPlayer('Ahsan');
    expect(player.displayName).toBe('Ahsan');
    expect(useLeaderboardStore.getState().player?.id).toBe(player.id);
  });

  it('records a round result tied to the current player', () => {
    useLeaderboardStore.getState().setPlayer('Ahsan');
    const result = useLeaderboardStore.getState().addResult({
      score: 82,
      pointsAwarded: 82,
      detectionRate: 0.9,
      meta: { framesSampled: 30, framesWithFace: 27 },
    });
    expect(result.playerName).toBe('Ahsan');
    expect(useLeaderboardStore.getState().results).toHaveLength(1);
    expect(useLeaderboardStore.getState().getResultById(result.id)).toEqual(
      result,
    );
  });

  it('throws when adding a result without a player', () => {
    expect(() =>
      useLeaderboardStore.getState().addResult({
        score: 50,
        pointsAwarded: 50,
        detectionRate: 1,
        meta: { framesSampled: 10, framesWithFace: 10 },
      }),
    ).toThrow();
  });
});

describe('buildLeaderboard', () => {
  it('sorts by total points, then best score, then earliest', () => {
    const board = buildLeaderboard([
      {
        id: '1',
        playerId: 'a',
        playerName: 'Alice',
        score: 70,
        pointsAwarded: 70,
        detectionRate: 1,
        createdAt: 100,
        meta: { framesSampled: 10, framesWithFace: 10 },
      },
      {
        id: '2',
        playerId: 'a',
        playerName: 'Alice',
        score: 30,
        pointsAwarded: 30,
        detectionRate: 1,
        createdAt: 200,
        meta: { framesSampled: 10, framesWithFace: 10 },
      },
      {
        id: '3',
        playerId: 'b',
        playerName: 'Bob',
        score: 100,
        pointsAwarded: 100,
        detectionRate: 1,
        createdAt: 50,
        meta: { framesSampled: 10, framesWithFace: 10 },
      },
    ]);

    expect(board[0]).toMatchObject({
      playerId: 'b',
      totalPoints: 100,
      bestScore: 100,
    });
    expect(board[1]).toMatchObject({
      playerId: 'a',
      totalPoints: 100,
      bestScore: 70,
    });
  });
});
