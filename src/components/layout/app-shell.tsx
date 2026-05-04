import { Link, NavLink } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
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
          </nav>
        </div>
      </header>
      <main className="container flex-1 py-8">{children}</main>
      <footer className="border-t border-border/60">
        <div className="container flex h-12 items-center justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} TrollFaces</span>
          <span>
            Camera processed on-device · Only score + name leaves your browser
          </span>
        </div>
      </footer>
    </div>
  );
}
