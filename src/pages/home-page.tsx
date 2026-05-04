import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Loader2, LogOut, Smile, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { GoogleButton } from '@/features/auth/google-button';
import { displayNameForUser, useAuth } from '@/features/auth/use-auth';
import { useLeaderboardStore } from '@/features/leaderboard/use-leaderboard-store';
import { isRemoteLeaderboardEnabled } from '@/lib/env';

const MAX_NAME = 20;

export function HomePage() {
  const navigate = useNavigate();
  const remoteEnabled = isRemoteLeaderboardEnabled();
  const auth = useAuth();
  const setPlayer = useLeaderboardStore((s) => s.setPlayer);
  const player = useLeaderboardStore((s) => s.player);

  const initialName =
    auth.status === 'signed-in' ? '' : player?.displayName ?? '';
  const [name, setName] = useState(initialName);

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

  const onSignIn = async () => {
    try {
      await auth.signInWithGoogle();
    } catch (e) {
      console.error(e);
    }
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
          {auth.status === 'loading' ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : auth.status === 'signed-in' ? (
            <SignedInEntry
              displayName={displayNameForUser(auth.user)}
              onPlay={() => navigate('/play')}
              onLeaderboard={() => navigate('/leaderboard')}
              onSignOut={() => auth.signOut()}
            />
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="display-name"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Display name
                </label>
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

              {remoteEnabled ? (
                <>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="h-px flex-1 bg-border" />
                    or
                    <span className="h-px flex-1 bg-border" />
                  </div>
                  <GoogleButton
                    type="button"
                    size="lg"
                    onClick={onSignIn}
                  />
                </>
              ) : null}
            </form>
          )}
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

interface SignedInEntryProps {
  displayName: string;
  onPlay: () => void;
  onLeaderboard: () => void;
  onSignOut: () => void;
}

function SignedInEntry({
  displayName,
  onPlay,
  onLeaderboard,
  onSignOut,
}: SignedInEntryProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Signed in as{' '}
        <span className="font-semibold text-foreground">{displayName}</span>
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="button" size="lg" className="flex-1" onClick={onPlay}>
          Start round
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          onClick={onLeaderboard}
        >
          <Trophy className="mr-1 h-4 w-4" /> Leaderboard
        </Button>
      </div>
      <button
        type="button"
        onClick={onSignOut}
        className="self-start text-xs text-muted-foreground underline-offset-4 hover:underline"
      >
        <LogOut className="mr-1 inline h-3 w-3" /> Sign out
      </button>
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
