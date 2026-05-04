import { Link, NavLink } from 'react-router-dom';
import { LogOut, Trophy } from 'lucide-react';
import { displayNameForUser, useAuth } from '@/features/auth/use-auth';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const auth = useAuth();
  const signedIn = auth.status === 'signed-in';

  return (
    <div className="flex min-h-full flex-col troll-grid">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <img
              src="/trollface.png"
              alt=""
              className="h-7 w-7 rounded-full"
              aria-hidden
            />
            <span>TrollFaces</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <NavLink
              to="/leaderboard"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-colors hover:text-foreground',
                  isActive
                    ? 'text-foreground'
                    : 'text-muted-foreground',
                )
              }
            >
              <Trophy className="h-4 w-4" />
              Leaderboard
            </NavLink>
            {signedIn ? (
              <div className="ml-2 flex items-center gap-2 border-l border-border/60 pl-3">
                <span
                  className="hidden max-w-[10rem] truncate text-xs text-muted-foreground sm:inline"
                  title={displayNameForUser(auth.user)}
                >
                  {displayNameForUser(auth.user)}
                </span>
                <button
                  type="button"
                  onClick={() => auth.signOut()}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Sign out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign out</span>
                </button>
              </div>
            ) : null}
          </nav>
        </div>
      </header>
      <main className="container flex-1 py-8">{children}</main>
      <footer className="border-t border-border/60">
        <div className="container flex h-12 items-center justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} TrollFaces</span>
        </div>
      </footer>
    </div>
  );
}
