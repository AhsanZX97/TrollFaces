import * as React from 'react';
import { cn } from '@/lib/utils';

interface CameraPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  className?: string;
  overlay?: React.ReactNode;
}

export function CameraPreview({
  videoRef,
  className,
  overlay,
}: CameraPreviewProps) {
  return (
    <div
      className={cn(
        'relative aspect-[4/3] w-full overflow-hidden rounded-2xl border bg-black shadow-lg',
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
      {overlay}
    </div>
  );
}
