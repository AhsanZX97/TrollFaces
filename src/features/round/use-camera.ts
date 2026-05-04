import { useCallback, useEffect, useRef, useState } from 'react';

export type CameraStatus =
  | 'idle'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'unsupported'
  | 'error';

interface UseCameraOptions {
  facingMode?: 'user' | 'environment';
  width?: number;
  height?: number;
}

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  status: CameraStatus;
  error: string | null;
  request: () => Promise<void>;
  stop: () => void;
}

export function useCamera({
  facingMode = 'user',
  width = 640,
  height = 480,
}: UseCameraOptions = {}): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const request = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
      setStatus('unsupported');
      setError('Your browser does not support camera access.');
      return;
    }
    setStatus('requesting');
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: width },
          height: { ideal: height },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      } else {
        // Video element not mounted yet — caller is responsible for retrying
        // once the ref attaches; otherwise stop the stream to free the camera.
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        setStatus('error');
        setError('Camera initialised before the video element was ready.');
        return;
      }
      setStatus('granted');
    } catch (e) {
      const err = e as DOMException;
      if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
        setStatus('denied');
        setError('Camera permission was denied.');
      } else if (err.name === 'NotFoundError') {
        setStatus('error');
        setError('No camera was found on this device.');
      } else {
        setStatus('error');
        setError(err.message || 'Camera could not be started.');
      }
    }
  }, [facingMode, width, height]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  return { videoRef, status, error, request, stop };
}
