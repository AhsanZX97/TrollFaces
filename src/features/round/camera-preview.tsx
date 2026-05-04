import * as React from 'react';
import { cn } from '@/lib/utils';

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  className?: string;
  overlay?: React.ReactNode;
  showScanlines?: boolean;
}

export function CameraPreview({
  videoRef,
  className,
  overlay,
  showScanlines,
}: CameraPreviewProps) {
  return (
    <div
      className={cn(
        'relative aspect-[4/3] w-full overflow-hidden border-2 border-ink bg-black shadow-stamp-lg',
        showScanlines && 'scanlines',
        className,
      )}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="mirror-x h-full w-full object-cover"
      />
      {/* corner crop marks */}
      <span className="pointer-events-none absolute left-2 top-2 h-3 w-3 border-l-2 border-t-2 border-paper" aria-hidden />
      <span className="pointer-events-none absolute right-2 top-2 h-3 w-3 border-r-2 border-t-2 border-paper" aria-hidden />
      <span className="pointer-events-none absolute bottom-2 left-2 h-3 w-3 border-b-2 border-l-2 border-paper" aria-hidden />
      <span className="pointer-events-none absolute bottom-2 right-2 h-3 w-3 border-b-2 border-r-2 border-paper" aria-hidden />
      {overlay}
    </div>
  );
}
