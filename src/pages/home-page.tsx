import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Camera,
  Loader2,
  LogOut,
  Smile,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EditionBadge } from '@/components/ui/edition-badge';
import { RuleLine } from '@/components/ui/rule-line';
import { GoogleButton } from '@/features/auth/google-button';
import { displayNameForUser, useAuth } from '@/features/auth/use-auth';
import { useLeaderboardStore } from '@/features/leaderboard/use-leaderboard-store';
import { isRemoteLeaderboardEnabled } from '@/lib/env';
import { cn } from '@/lib/utils';

const MAX_NAME = 20;

export function HomePage() {
  const navigate = useNavigate();
  const remoteEnabled = isRemoteLeaderboardEnabled();
  const auth = useAuth();
  const setPlayer = useLeaderboardStore((s) => s.setPlayer);
  const existingPlayer = useLeaderboardStore((s) => s.player);
  const totalRounds = useLeaderboardStore((s) => s.results.length);

  const initialName =
    auth.status === 'signed-in' ? '' : existingPlayer?.displayName ?? '';
  const [name, setName] = useState(initialName);
  const [signInLoading, setSignInLoading] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);

  const trimmed = name.trim();
  const isValid = useMemo(
    () => trimmed.length >= 2 && trimmed.length <= MAX_NAME,
    [trimmed],
  );

  // If the user signs in mid-session, clear the name input so we don't
  // stash a stale local-only name.
  useEffect(() => {
    if (auth.status === 'signed-in') setName('');
  }, [auth.status]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setPlayer(trimmed);
    navigate('/play');
  };

  const onSignIn = async () => {
    setSignInLoading(true);
    setSignInError(null);
    try {
      await auth.signInWithGoogle();
      // Browser will redirect to Google; we only get here on synchronous
      // failure (e.g. popup blocked, supabase misconfigured).
    } catch (e) {
      setSignInError(
        e instanceof Error ? e.message : 'Could not start Google sign-in.',
      );
      setSignInLoading(false);
    }
  };

  const editionNo = useMemo(() => {
    const start = new Date(2026, 0, 1).getTime();
    const day = Math.floor((Date.now() - start) / 86_400_000);
    return String(day).padStart(3, '0');
  }, []);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-12 sm:gap-16">
      {/* Masthead */}
      <header className="flex flex-col items-center gap-5 text-center">
        <EditionBadge no={editionNo} label="Daily Edition" />

        <div className="relative">
          <h1 className="masthead text-balance text-[18vw] sm:text-[120px] lg:text-[156px]">
            Troll<span className="text-accent">Faces</span>
          </h1>
          <span
            aria-hidden
            className="pointer-events-none absolute -right-2 top-2 hidden -rotate-6 border-2 border-ink bg-accent px-2 py-0.5 font-mono text-[10px] uppercase tracking-stamp text-accent-foreground shadow-stamp-sm sm:block"
          >
            Hot off the press
          </span>
        </div>

        <p className="max-w-xl text-pretty font-mono text-xs uppercase tracking-stamp text-muted-fg sm:text-sm">
          The 10-second troll-face challenge. Match the meme. Score the points.
          Climb the leaderboard.
        </p>

        <RuleLine label="Vol. I" />
      </header>

      {/* Sign-in card */}
      <section className="grid gap-8 lg:grid-cols-[1.2fr,1fr] lg:items-center">
        <div className="ink-box p-6 sm:p-8">
          {auth.status === 'loading' ? (
            <div className="flex items-center justify-center gap-2 py-12 font-mono text-[10px] uppercase tracking-stamp text-muted-fg">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking credentials…
            </div>
          ) : auth.status === 'signed-in' ? (
            <SignedInEntry
              displayName={displayNameForUser(auth.user)}
              onPlay={() => navigate('/play')}
              onLeaderboard={() => navigate('/leaderboard')}
              onSignOut={() => auth.signOut()}
            />
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] uppercase tracking-stamp text-muted-fg">
                  Step 01 — Identify
                </span>
                <span className="font-mono text-[10px] uppercase tracking-stamp text-muted-fg tabular">
                  {trimmed.length}/{MAX_NAME}
                </span>
              </div>

              <label
                htmlFor="display-name"
                className="font-display text-3xl uppercase leading-none sm:text-4xl"
              >
                What do we call you?
              </label>

              <Input
                id="display-name"
                value={name}
                maxLength={MAX_NAME}
                onChange={(e) => setName(e.target.value)}
                placeholder="troll_lord"
                aria-describedby="display-name-help"
                autoFocus
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
              />

              <p
                id="display-name-help"
                className="font-mono text-[10px] uppercase tracking-stamp text-muted-fg"
              >
                {remoteEnabled
                  ? '2–20 characters. Anonymous play — sign in below to claim it.'
                  : '2–20 characters. Stays in your browser until Supabase is wired.'}
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  type="submit"
                  size="lg"
                  variant="accent"
                  className="flex-1"
                  disabled={!isValid}
                >
                  {isValid ? 'Press Start' : 'Enter a name to play'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/leaderboard')}
                >
                  <Trophy className="h-4 w-4" /> Leaderboard
                </Button>
              </div>

              {remoteEnabled ? (
                <>
                  <RuleLine glyph="○ ○ ○" label="or" className="pt-1" />
                  <GoogleButton
                    type="button"
                    onClick={onSignIn}
                    loading={signInLoading}
                  />
                  <p className="text-center font-mono text-[10px] uppercase tracking-stamp text-muted-fg">
                    Save scores to your Google account · skip naming
                  </p>
                  {signInError ? (
                    <p
                      role="alert"
                      className="border-2 border-destructive bg-destructive/10 p-3 font-mono text-[10px] text-destructive"
                    >
                      {signInError}
                    </p>
                  ) : null}
                </>
              ) : null}
            </form>
          )}
        </div>

        {/* Sidebar — newspaper-style stats */}
        <aside className="flex flex-col gap-4 lg:gap-5">
          <StatBox
            kicker="Today's Run"
            number={totalRounds}
            unit="rounds played on this device"
          />
          <StatBox
            kicker="Round Length"
            number={10}
            unit="seconds. that's the whole game."
            tone="accent"
          />
          <div className="ink-box flex items-start gap-3 p-4">
            <span className="mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center border-2 border-ink bg-accent text-[10px] font-bold text-accent-foreground">
              !
            </span>
            <p className="font-mono text-[11px] leading-relaxed text-ink">
              Camera frames stay on your device. Only your score and name leave
              the browser.
            </p>
          </div>
        </aside>
      </section>

      <RuleLine label="How to play" glyph="●●●" />

      <section className="grid gap-4 sm:grid-cols-3">
        <HowStep
          n={1}
          icon={<Camera className="h-5 w-5" />}
          title="Allow camera"
          desc="Processed on-device. Nothing uploaded."
        />
        <HowStep
          n={2}
          icon={<Smile className="h-5 w-5" />}
          title="Match the face"
          desc="Wide grin, squinted eyes, no mercy."
        />
        <HowStep
          n={3}
          icon={<Trophy className="h-5 w-5" />}
          title="Score points"
          desc="Best run climbs the daily ranks."
        />
      </section>
    </div>
  );
}

function SignedInEntry({
  displayName,
  onPlay,
  onLeaderboard,
  onSignOut,
}: {
  displayName: string;
  onPlay: () => void;
  onLeaderboard: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-stamp text-muted-fg">
          Step 01 — Identified
        </span>
        <span className="inline-flex items-center gap-1.5 border-2 border-ink bg-accent px-2 py-0.5 font-mono text-[10px] uppercase tracking-stamp text-accent-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-accent-foreground" />
          Verified
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="font-mono text-[10px] uppercase tracking-stamp text-muted-fg">
          Signed in as
        </span>
        <span className="font-display text-3xl uppercase leading-none sm:text-4xl">
          {displayName}
        </span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          size="lg"
          variant="accent"
          className="flex-1"
          onClick={onPlay}
        >
          Press Start
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="lg"
          variant="outline"
          onClick={onLeaderboard}
        >
          <Trophy className="h-4 w-4" /> Leaderboard
        </Button>
      </div>

      <button
        type="button"
        onClick={onSignOut}
        className="self-start font-mono text-[10px] uppercase tracking-stamp text-muted-fg underline-offset-[6px] hover:text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <LogOut className="mr-1 inline h-3 w-3" /> Sign out
      </button>
    </div>
  );
}

function StatBox({
  kicker,
  number,
  unit,
  tone = 'ink',
}: {
  kicker: string;
  number: number;
  unit: string;
  tone?: 'ink' | 'accent';
}) {
  return (
    <div
      className={cn(
        'ink-box flex flex-col gap-1 p-4 sm:p-5',
        tone === 'accent' && 'bg-accent text-accent-foreground',
      )}
    >
      <span className="font-mono text-[10px] uppercase tracking-stamp opacity-80">
        {kicker}
      </span>
      <span className="font-display text-5xl leading-none tabular sm:text-6xl">
        {number}
      </span>
      <span className="font-mono text-[10px] uppercase tracking-stamp opacity-80">
        {unit}
      </span>
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
    <div className="ink-box flex flex-col gap-3 p-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-stamp text-muted-fg">
          Step {String(n).padStart(2, '0')}
        </span>
        <span className="flex h-9 w-9 items-center justify-center border-2 border-ink bg-accent text-accent-foreground">
          {icon}
        </span>
      </div>
      <div className="font-display text-2xl uppercase leading-none">
        {title}
      </div>
      <p className="text-sm text-muted-fg">{desc}</p>
    </div>
  );
}
