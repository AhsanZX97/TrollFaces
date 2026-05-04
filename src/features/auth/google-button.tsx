import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GoogleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  size?: 'default' | 'lg';
}

export const GoogleButton = React.forwardRef<
  HTMLButtonElement,
  GoogleButtonProps
>(
  (
    { className, loading, children, disabled, size = 'lg', ...props },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={props.type ?? 'button'}
        disabled={disabled || loading}
        className={cn(
          'group relative inline-flex w-full items-center justify-center gap-3',
          'border-2 border-ink bg-paper text-ink',
          'font-mono uppercase tracking-stamp',
          'shadow-stamp transition-[transform,box-shadow,background-color] duration-150 ease-out',
          'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-stamp-pressed',
          'active:translate-x-[4px] active:translate-y-[4px] active:shadow-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-stamp',
          size === 'lg' ? 'h-14 px-6 text-sm' : 'h-12 px-5 text-xs',
          className,
        )}
        {...props}
      >
        <span
          aria-hidden
          className="flex h-7 w-7 items-center justify-center border-2 border-ink bg-paper"
        >
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <GoogleIcon className="h-3.5 w-3.5" />
          )}
        </span>
        <span className="leading-none">
          {children ?? 'Continue with Google'}
        </span>
      </button>
    );
  },
);
GoogleButton.displayName = 'GoogleButton';

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.1 4.1-3.9 5.5l6.2 5.2C41.6 35.6 44 30.2 44 24c0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}
