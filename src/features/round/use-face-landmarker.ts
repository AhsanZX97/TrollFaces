import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FaceLandmarker,
  FilesetResolver,
  type FaceLandmarkerResult,
} from '@mediapipe/tasks-vision';

const WASM_BASE =
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

type LandmarkerStatus = 'idle' | 'loading' | 'ready' | 'error';

interface UseFaceLandmarkerReturn {
  status: LandmarkerStatus;
  error: string | null;
  isReady: () => boolean;
  detect: (
    video: HTMLVideoElement,
    timestampMs: number,
  ) => FaceLandmarkerResult | null;
}

export function useFaceLandmarker(): UseFaceLandmarkerReturn {
  const [status, setStatus] = useState<LandmarkerStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    (async () => {
      try {
        const fileset = await FilesetResolver.forVisionTasks(WASM_BASE);
        const landmarker = await FaceLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: false,
        });
        if (cancelled) {
          landmarker.close();
          return;
        }
        landmarkerRef.current = landmarker;
        setStatus('ready');
      } catch (e) {
        if (cancelled) return;
        setError((e as Error).message || 'Failed to load face landmarker');
        setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, []);

  const isReady = useCallback(() => {
    return landmarkerRef.current != null;
  }, []);

  const detect = useCallback(
    (video: HTMLVideoElement, timestampMs: number) => {
      const lm = landmarkerRef.current;
      if (!lm || video.readyState < 2) return null;
      try {
        return lm.detectForVideo(video, timestampMs);
      } catch {
        return null;
      }
    },
    [],
  );

  return { status, error, isReady, detect };
}
