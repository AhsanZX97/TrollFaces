import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Smile, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useLeaderboardStore } from '@/features/leaderboard/use-leaderboard-store';

const MAX_NAME = 20;

export function HomePage() {
  const navigate = useNavigate();
  const existingPlayer = useLeaderboardStore((s) => s.player);
  const setPlayer = useLeaderboardStore((s) => s.setPlayer);
  const [name, setName] = useState(existingPlayer?.displayName ?? '');

  const trimmed = name.trim();
  const isValid = useMemo(
    () => trimmed.length >= 2 && trimmed.length <= MAX_NAME,
    [trimmed],
  );

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setPlayer(trimmed);
    navigate('/play');
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-10 py-8">
      <header className="text-center">
        <div className="mb-4 flex justify-center">
          <img
            src="/trollface.png"
            alt=""
            className="h-20 w-20 rounded-2xl border bg-white p-2 shadow-sm"
            aria-hidden
          />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">TrollFaces</h1>
        <p className="mt-2 text-muted-foreground">
          The 10-second troll-face challenge.
        </p>
      </header>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <label
              htmlFor="display-name"
              className="text-sm font-medium text-muted-foreground"
            >
              Your display name
            </label>
            <div className="flex flex-col gap-1">
              <Input
                id="display-name"
                value={name}
                maxLength={MAX_NAME}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. troll_lord"
                aria-describedby="display-name-counter"
                autoFocus
              />
              <div
                id="display-name-counter"
                className="text-right text-xs text-muted-foreground"
              >
                {trimmed.length}/{MAX_NAME}
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="submit"
                size="lg"
                className="flex-1"
                disabled={!isValid}
              >
                {isValid ? 'Start round' : 'Enter a name to play'}
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={() => navigate('/leaderboard')}
              >
                <Trophy className="mr-1 h-4 w-4" /> Leaderboard
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Sign-in coming later. Scores are saved to this browser for now.
            </p>
          </form>
        </CardContent>
      </Card>

      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          How to play
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <HowStep
            n={1}
            icon={<Camera className="h-5 w-5" />}
            title="Allow camera"
            desc="Processed on your device."
          />
          <HowStep
            n={2}
            icon={<Smile className="h-5 w-5" />}
            title="Match the face"
            desc="Wide grin, squinted eyes."
          />
          <HowStep
            n={3}
            icon={<Trophy className="h-5 w-5" />}
            title="Score points"
            desc="Climb the leaderboard."
          />
        </div>
      </section>
    </div>
  );
}

function HowStep({
  n,
  icon,
  title,
  desc,
}: {
  n: number;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
          {icon}
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Step {n}</div>
          <div className="font-medium">{title}</div>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
      </CardContent>
    </Card>
  );
}
