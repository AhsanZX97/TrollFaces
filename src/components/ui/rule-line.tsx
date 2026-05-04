import { cn } from '@/lib/utils';

interface RuleLineProps {
  label?: string;
  glyph?: string;
  className?: string;
}

export function RuleLine({ label, glyph = '★ ★ ★', className }: RuleLineProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 font-mono text-[10px] uppercase tracking-stamp text-ink',
        className,
      )}
    >
      <span className="h-px flex-1 bg-ink/50" />
      <span aria-hidden>{glyph}</span>
      {label ? <span>{label}</span> : null}
      {label ? <span aria-hidden>{glyph}</span> : null}
      <span className="h-px flex-1 bg-ink/50" />
    </div>
  );
}
