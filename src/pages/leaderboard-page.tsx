import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Loader2, Play, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { fetchLeaderboardRemote } from '@/features/leaderboard/supabase-leaderboard';
import { isRemoteLeaderboardEnabled } from '@/lib/env';
import type { LeaderboardEntry } from '@/features/leaderboard/types';
import {
  buildLeaderboard,
  useLeaderboardStore,
} from '@/features/leaderboard/use-leaderboard-store';

export function LeaderboardPage() {
  const results = useLeaderboardStore((s) => s.results);
  const player = useLeaderboardStore((s) => s.player);
  const remoteEnabled = isRemoteLeaderboardEnabled();

  const localBoard = useMemo(() => buildLeaderboard(results), [results]);
  const [remoteBoard, setRemoteBoard] = useState<LeaderboardEntry[] | null>(
    null,
  );
  const [remoteLoading, setRemoteLoading] = useState(false);

  useEffect(() => {
    if (!remoteEnabled) {
      setRemoteBoard(null);
      return;
    }
    setRemoteLoading(true);
    fetchLeaderboardRemote()
      .then(setRemoteBoard)
      .catch(() => setRemoteBoard([]))
      .finally(() => setRemoteLoading(false));
  }, [remoteEnabled]);

  const board = useMemo(
    () => (remoteEnabled ? remoteBoard ?? [] : localBoard),
    [remoteEnabled, remoteBoard, localBoard],
  );
  const showRemoteSpinner =
    remoteEnabled && remoteLoading && remoteBoard === null;

  const myRank = useMemo(() => {
    if (!player) return null;
    const idx = board.findIndex((b) => b.playerId === player.id);
    return idx === -1 ? null : idx + 1;
  }, [board, player]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Global Leaderboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Ranked by total points · best score breaks ties.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {myRank ? (
            <span className="text-sm text-muted-foreground">
              You are{' '}
              <span className="font-semibold text-foreground">
                rank #{myRank}
              </span>
            </span>
          ) : null}
          <Button asChild>
            <Link to="/play">
              <Play className="mr-1 h-4 w-4" /> Play
            </Link>
          </Button>
        </div>
      </header>

      <Card>
        <CardContent className="p-0">
          {showRemoteSpinner ? (
            <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm">Loading leaderboard…</p>
            </div>
          ) : board.length === 0 ? (
            <EmptyState />
          ) : (
            <ol className="divide-y">
              {board.map((entry, i) => {
                const isMe = entry.playerId === player?.id;
                return (
                  <li
                    key={entry.playerId}
                    className={cn(
                      'flex items-center gap-4 px-5 py-4 transition-colors',
                      isMe && 'bg-primary/10',
                    )}
                  >
                    <RankBadge rank={i + 1} />
                    <div className="flex flex-1 items-baseline gap-2">
                      <span className="font-medium">{entry.playerName}</span>
                      {isMe ? (
                        <span className="text-xs text-primary">(you)</span>
                      ) : null}
                    </div>
                    <div className="hidden text-right text-xs text-muted-foreground sm:block">
                      <div>
                        Best: <span className="font-semibold">
                          {entry.bestScore}
                        </span>
                      </div>
                      <div>{entry.rounds} round{entry.rounds === 1 ? '' : 's'}</div>
                    </div>
                    <div className="w-20 text-right font-mono text-lg tabular-nums">
                      {entry.totalPoints}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-muted-foreground">
        {remoteEnabled
          ? 'Leaderboard data is stored in Supabase (shared across all players).'
          : 'Scores are stored only in this browser until you add Supabase (see docs/supabase.md).'}
      </p>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const isPodium = rank <= 3;
  return (
    <div
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold',
        rank === 1 && 'bg-amber-500/20 text-amber-500',
        rank === 2 && 'bg-zinc-400/20 text-zinc-400',
        rank === 3 && 'bg-orange-500/20 text-orange-500',
        !isPodium && 'bg-muted text-muted-foreground',
      )}
    >
      {rank === 1 ? <Crown className="h-4 w-4" /> : rank}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <Trophy className="h-10 w-10 text-muted-foreground" />
      <p className="font-medium">No rounds yet</p>
      <p className="text-sm text-muted-foreground">
        Play a round to take the top spot.
      </p>
      <Button asChild className="mt-2">
        <Link to="/play">
          <Play className="mr-1 h-4 w-4" /> Play first round
        </Link>
      </Button>
    </div>
  );
}
