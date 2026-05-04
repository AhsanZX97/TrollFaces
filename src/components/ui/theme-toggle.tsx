import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/use-theme';
import { cn } from '@/lib/utils';

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      aria-pressed={isDark}
      className={cn(
        'relative inline-flex h-10 w-10 items-center justify-center border-2 border-ink bg-paper text-ink shadow-stamp',
        'transition-[transform,box-shadow] duration-150 ease-out',
        'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-stamp-pressed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
