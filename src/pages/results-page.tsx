import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader2, Repeat, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { LeaderboardEntry } from '@/features/leaderboard/types';
import {
  buildLeaderboard,
  useLeaderboardStore,
} from '@/features/leaderboard/use-leaderboard-store';
import {
  fetchLeaderboardRemote,
  fetchRoundResultRemote,
} from '@/features/leaderboard/supabase-leaderboard';
import { isRemoteLeaderboardEnabled } from '@/lib/env';
import type { RoundResult } from '@/features/round/types';
import { ReferenceFace } from '@/features/round/reference-face';

export function ResultsPage() {
  const { roundId } = useParams<{ roundId: string }>();
  const navigate = useNavigate();
  const storeResult = useLeaderboardStore((s) =>
    roundId ? s.getResultById(roundId) : undefined,
  );
  const results = useLeaderboardStore((s) => s.results);
  const player = useLeaderboardStore((s) => s.player);

  const [remoteResult, setRemoteResult] = useState<RoundResult | null>(null);
  const [fetchingRemote, setFetchingRemote] = useState(false);
  const remoteEnabled = isRemoteLeaderboardEnabled();

  useEffect(() => {
    if (!roundId || storeResult || !remoteEnabled) return;
    setFetchingRemote(true);
    fetchRoundResultRemote(roundId)
      .then(setRemoteResult)
      .catch(() => setRemoteResult(null))
      .finally(() => setFetchingRemote(false));
  }, [roundId, storeResult, remoteEnabled]);

  const result = storeResult ?? remoteResult;

  const [remoteBoard, setRemoteBoard] = useState<LeaderboardEntry[] | null>(
    null,
  );

  useEffect(() => {
    if (!player || !result) return;
    if (!remoteEnabled) {
      setRemoteBoard(null);
      return;
    }
    fetchLeaderboardRemote()
      .then(setRemoteBoard)
      .catch(() => setRemoteBoard(null));
  }, [player, result, remoteEnabled]);

  const rank = useMemo(() => {
    if (!player) return null;
    if (remoteEnabled) {
      if (remoteBoard === null) return null;
      const idx = remoteBoard.findIndex((b) => b.playerId === player.id);
      return idx === -1 ? null : idx + 1;
    }
    const board = buildLeaderboard(results);
    const idx = board.findIndex((b) => b.playerId === player.id);
    return idx === -1 ? null : idx + 1;
  }, [player, results, remoteBoard, remoteEnabled]);

  if (fetchingRemote) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading round…</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="mb-4 text-muted-foreground">
          That round was not found.
        </p>
        <Button onClick={() => navigate('/')}>Back to home</Button>
      </div>
    );
  }

  const isZero = result.score === 0;
  const isNoFace = result.detectionRate === 0;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <header className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">
          {isNoFace
            ? 'No face detected'
            : isZero
            ? 'Detection too low'
            : 'Round complete'}
        </h1>
        <p className="text-sm text-muted-foreground">
          Nice try, {result.playerName}.
        </p>
      </header>

      <Card>
        <CardContent className="flex flex-col items-center gap-6 p-8">
          <ReferenceFace size="md" />

          <div className="flex flex-col items-center gap-1">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Similarity score
            </span>
            <span className="font-mono text-7xl font-bold tabular-nums">
              {result.score}
            </span>
            <span className="text-sm text-muted-foreground">/ 100</span>
          </div>

          <div className="grid w-full grid-cols-2 gap-3 text-sm">
            <Stat
              label="Points earned"
              value={`+${result.pointsAwarded}`}
              tone="primary"
            />
            <Stat
              label="Face detected"
              value={`${Math.round(result.detectionRate * 100)}%`}
              tone={result.detectionRate >= 0.7 ? 'success' : 'warning'}
            />
          </div>

          <div className="flex w-full flex-col gap-2">
            <div className="flex items-baseline justify-between text-xs text-muted-foreground">
              <span>Detection across the round</span>
              <span>
                {result.meta.framesWithFace}/{result.meta.framesSampled} frames
              </span>
            </div>
            <Progress value={result.detectionRate * 100} />
          </div>

          {rank ? (
            <Badge variant="default">
              <Trophy className="mr-1 h-3 w-3" /> Rank #{rank}
            </Badge>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          size="lg"
          className="flex-1"
          onClick={() => navigate('/play')}
        >
          <Repeat className="mr-1 h-4 w-4" /> Play again
        </Button>
        <Button asChild size="lg" variant="outline" className="flex-1">
          <Link to="/leaderboard">
            <Trophy className="mr-1 h-4 w-4" /> Leaderboard
          </Link>
        </Button>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'primary' | 'success' | 'warning';
}) {
  const toneClass =
    tone === 'success'
      ? 'text-emerald-500'
      : tone === 'warning'
      ? 'text-amber-500'
      : 'text-primary';
  return (
    <div className="rounded-lg border bg-muted/40 p-3 text-center">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-xl font-semibold ${toneClass}`}>{value}</div>
    </div>
  );
}
