import { cn } from '@/lib/utils';

interface MarqueeStripProps {
  text?: string;
  className?: string;
  speed?: 'normal' | 'fast';
}

const SEPARATOR = '   ★   ';

export function MarqueeStrip({
  text = 'TROLL FACES · MAKE THE FACE · 10 SECONDS · NO MERCY · DAILY EDITION',
  className,
  speed = 'normal',
}: MarqueeStripProps) {
  const line = `${text}${SEPARATOR}`;
  return (
    <div
      className={cn(
        'overflow-hidden border-y-2 border-ink bg-ink py-1.5 text-paper',
        className,
      )}
      aria-hidden
    >
      <div
        className={cn(
          'flex w-max whitespace-nowrap font-mono text-[10px] uppercase tracking-stamp',
          speed === 'fast' ? 'animate-marquee-fast' : 'animate-marquee',
        )}
      >
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} className="px-3">
            {line}
          </span>
        ))}
      </div>
    </div>
  );
}
