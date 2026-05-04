import * as React from 'react';
import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-12 w-full bg-paper text-ink placeholder:text-muted-fg',
          'border-2 border-ink shadow-stamp',
          'px-4 py-2 text-base font-mono tabular',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          'focus-visible:translate-x-[2px] focus-visible:translate-y-[2px] focus-visible:shadow-stamp-pressed',
          'transition-[transform,box-shadow] duration-150 ease-out',
          'disabled:cursor-not-allowed disabled:opacity-60',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = 'Input';
