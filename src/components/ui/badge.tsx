import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 border-2 border-ink px-2.5 py-1 font-mono text-[10px] uppercase tracking-stamp leading-none',
  {
    variants: {
      variant: {
        default: 'bg-paper text-ink',
        accent: 'bg-accent text-accent-foreground',
        success: 'bg-emerald-500 text-ink',
        warning: 'bg-amber-300 text-ink',
        destructive: 'bg-destructive text-destructive-foreground',
        outline: 'bg-transparent text-ink',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
