import { useCallback, useEffect, useRef, useState } from 'react';

export interface RoundTimerState {
  remaining: number;
  isRunning: boolean;
  start: () => void;
  stop: () => void;
  reset: (duration?: number) => void;
}

export function useRoundTimer(
  initialDuration: number,
  onComplete?: () => void,
): RoundTimerState {
  const [duration, setDuration] = useState(initialDuration);
  const [remaining, setRemaining] = useState(initialDuration);
  const [isRunning, setIsRunning] = useState(false);
  const startedAtRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const tick = useCallback(() => {
    if (startedAtRef.current == null) return;
    const elapsed = (performance.now() - startedAtRef.current) / 1000;
    const next = Math.max(0, duration - elapsed);
    setRemaining(next);
    if (next <= 0) {
      setIsRunning(false);
      startedAtRef.current = null;
      onCompleteRef.current?.();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [duration]);

  const start = useCallback(() => {
    if (isRunning) return;
    startedAtRef.current = performance.now();
    setIsRunning(true);
    rafRef.current = requestAnimationFrame(tick);
  }, [isRunning, tick]);

  const stop = useCallback(() => {
    setIsRunning(false);
    startedAtRef.current = null;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const reset = useCallback(
    (newDuration?: number) => {
      stop();
      const d = newDuration ?? duration;
      setDuration(d);
      setRemaining(d);
    },
    [duration, stop],
  );

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { remaining, isRunning, start, stop, reset };
}
