import { Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FaceStatusProps {
  detected: boolean;
  hint?: string | null;
}

export function FaceStatus({ detected, hint }: FaceStatusProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge variant={detected ? 'success' : 'warning'}>
        {detected ? (
          <>
            <Eye className="h-3 w-3" /> Face locked
          </>
        ) : (
          <>
            <EyeOff className="h-3 w-3" /> Searching…
          </>
        )}
      </Badge>
      {hint ? (
        <span className="font-mono text-[10px] uppercase tracking-stamp text-muted-fg">
          {hint}
        </span>
      ) : null}
    </div>
  );
}
