import { cn } from '@/lib/utils';

interface EditionBadgeProps {
  no?: number | string;
  label?: string;
  className?: string;
}

export function EditionBadge({
  no,
  label = 'Daily Edition',
  className,
}: EditionBadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 border-2 border-ink bg-paper px-3 py-1 font-mono text-[10px] uppercase tracking-stamp text-ink',
        className,
      )}
    >
      <span>{label}</span>
      {no !== undefined ? (
        <>
          <span className="h-3 w-px bg-ink/50" />
          <span className="tabular">No. {no}</span>
        </>
      ) : null}
    </div>
  );
}
