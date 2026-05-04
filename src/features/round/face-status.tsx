import { Eye, EyeOff } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FaceStatusProps {
  detected: boolean;
  hint?: string | null;
}

export function FaceStatus({ detected, hint }: FaceStatusProps) {
  return (
    <div className="flex items-center gap-2">
      <Badge variant={detected ? 'success' : 'warning'}>
        {detected ? (
          <>
            <Eye className="mr-1 h-3 w-3" /> Face detected
          </>
        ) : (
          <>
            <EyeOff className="mr-1 h-3 w-3" /> Looking for face…
          </>
        )}
      </Badge>
      {hint ? (
        <span className="text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </div>
  );
}
