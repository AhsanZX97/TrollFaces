import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Loader2, Play, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RuleLine } from '@/components/ui/rule-line';
import { cn } from '@/lib/utils';
import { fetchLeaderboardRemote } from '@/features/leaderboard/supabase-leaderboard';
import { isRemoteLeaderboardEnabled } from '@/lib/env';
import type { LeaderboardEntry } from '@/features/leaderboard/types';
import {
  buildLeaderboard,
  useLeaderboardStore,
} from '@/features/leaderboard/use-leaderboard-store';

const TIERS: { min: number; label: string }[] = [
  { min: 90, label: 'The Troll' },
  { min: 75, label: 'Grinner' },
  { min: 55, label: 'Apprentice' },
  { min: 0, label: 'Amateur' },
];

function tierFor(bestScore: number) {
  return TIERS.find((t) => bestScore >= t.min) ?? TIERS[TIERS.length - 1];
}

export function LeaderboardPage() {
  const results = useLeaderboardStore((s) => s.results);
  const player = useLeaderboardStore((s) => s.player);
  const remoteEnabled = isRemoteLeaderboardEnabled();

  const localBoard = useMemo(() => buildLeaderboard(results), [results]);
  const [remoteBoard, setRemoteBoard] = useState<LeaderboardEntry[] | null>(
    null,
  );
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteError, setRemoteError] = useState<string | null>(null);

  useEffect(() => {
    if (!remoteEnabled) {
      setRemoteBoard(null);
      setRemoteError(null);
      return;
    }
    let cancelled = false;
    setRemoteLoading(true);
    setRemoteError(null);
    fetchLeaderboardRemote()
      .then((data) => {
        if (cancelled) return;
        setRemoteBoard(data);
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setRemoteBoard([]);
        setRemoteError(
          e instanceof Error ? e.message : 'Could not reach the leaderboard.',
        );
      })
      .finally(() => {
        if (!cancelled) setRemoteLoading(false);
      });
    return () => {
      cancelled = true;
    };
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
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <header className="flex flex-col items-center gap-3 text-center">
        <span className="font-mono text-[10px] uppercase tracking-stamp text-muted-fg">
          {remoteEnabled ? 'Global · Live' : 'This Browser Only'}
        </span>
        <h1 className="masthead text-5xl sm:text-7xl">Hall of Trolls</h1>
        <p className="max-w-md text-pretty font-mono text-[11px] uppercase tracking-stamp text-muted-fg">
          Ranked by total points · best score breaks ties · earliest wins.
        </p>
        <RuleLine label="Standings" />
      </header>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="font-mono text-[11px] uppercase tracking-stamp text-muted-fg">
          {myRank ? (
            <>
              You stand at{' '}
              <span className="font-bold text-ink">rank #{myRank}</span>
            </>
          ) : (
            <>You haven't ranked yet — play a round.</>
          )}
        </span>
        <Button asChild variant="accent" size="default">
          <Link to="/play">
            <Play className="h-4 w-4" /> Play
          </Link>
        </Button>
      </div>

      {remoteError ? (
        <div
          role="alert"
          className="border-2 border-destructive bg-destructive/10 px-4 py-3 font-mono text-[11px] text-destructive"
        >
          Couldn't reach the leaderboard server: {remoteError}
        </div>
      ) : null}

      <div className="ink-box overflow-hidden">
        {showRemoteSpinner ? (
          <div className="flex flex-col items-center gap-3 py-16 text-muted-fg">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="font-mono text-[10px] uppercase tracking-stamp">
              Loading leaderboard…
            </p>
          </div>
        ) : board.length === 0 ? (
          <EmptyState />
        ) : (
          <ol>
            <li className="hidden border-b-2 border-ink bg-secondary px-5 py-3 font-mono text-[10px] uppercase tracking-stamp text-muted-fg sm:grid sm:grid-cols-[60px,1fr,140px,80px,80px] sm:items-center">
              <span>Rank</span>
              <span>Player</span>
              <span>Tier</span>
              <span className="text-right">Best</span>
              <span className="text-right">Points</span>
            </li>
            {board.map((entry, i) => {
              const isMe = entry.playerId === player?.id;
              const t = tierFor(entry.bestScore);
              return (
                <li
                  key={entry.playerId}
                  className={cn(
                    'flex flex-col gap-2 border-b border-ink/30 px-4 py-3 sm:grid sm:grid-cols-[60px,1fr,140px,80px,80px] sm:items-center sm:gap-3 sm:px-5 sm:py-4',
                    'animate-fade-up',
                    isMe && 'bg-accent/10',
                    'last:border-b-0',
                  )}
                  style={{ animationDelay: `${Math.min(i * 30, 600)}ms` }}
                >
                  <RankBadge rank={i + 1} />
                  <div className="flex flex-1 items-baseline gap-2">
                    <span className="font-display text-lg uppercase leading-none">
                      {entry.playerName}
                    </span>
                    {isMe ? (
                      <span className="font-mono text-[10px] uppercase tracking-stamp text-accent">
                        (you)
                      </span>
                    ) : null}
                  </div>
                  <span className="hidden border-2 border-ink bg-paper px-2 py-0.5 font-mono text-[10px] uppercase tracking-stamp text-ink sm:inline-block sm:w-fit">
                    {t.label}
                  </span>
                  <div className="flex items-baseline justify-between text-right sm:block">
                    <span className="font-mono text-[10px] uppercase tracking-stamp text-muted-fg sm:hidden">
                      Best
                    </span>
                    <span className="font-mono tabular text-base font-bold text-ink">
                      {entry.bestScore}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between text-right sm:block">
                    <span className="font-mono text-[10px] uppercase tracking-stamp text-muted-fg sm:hidden">
                      Points
                    </span>
                    <span className="font-display text-2xl leading-none tabular">
                      {entry.totalPoints}
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <p className="text-center font-mono text-[10px] uppercase tracking-stamp text-muted-fg">
        {remoteEnabled
          ? 'Stored in Supabase · shared across all players'
          : 'Stored locally in your browser · add Supabase env to share'}
      </p>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  const isPodium = rank <= 3;
  if (rank === 1) {
    return (
      <div
        className="relative flex h-12 w-12 shrink-0 items-center justify-center border-2 border-ink bg-accent text-accent-foreground shadow-stamp-sm"
        title="Champion"
      >
        <Crown className="h-5 w-5" />
        <span className="absolute -bottom-1 -right-1 inline-flex h-4 w-4 items-center justify-center border-2 border-ink bg-paper font-mono text-[8px] font-bold text-ink">
          1
        </span>
      </div>
    );
  }
  return (
    <div
      className={cn(
        'flex h-12 w-12 shrink-0 items-center justify-center border-2 border-ink font-display text-xl tabular leading-none shadow-stamp-sm',
        rank === 2 && 'bg-secondary text-ink',
        rank === 3 && 'bg-amber-300 text-ink',
        !isPodium && 'bg-paper text-ink',
      )}
    >
      {rank}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center border-2 border-ink bg-paper shadow-stamp-sm">
        <Trophy className="h-8 w-8 text-muted-fg" />
      </div>
      <p className="font-display text-3xl uppercase leading-none">
        No rounds yet
      </p>
      <p className="font-mono text-[11px] uppercase tracking-stamp text-muted-fg">
        Play one round to take the top spot
      </p>
      <Button asChild variant="accent" className="mt-2">
        <Link to="/play">
          <Play className="h-4 w-4" /> Play first round
        </Link>
      </Button>
    </div>
  );
}
