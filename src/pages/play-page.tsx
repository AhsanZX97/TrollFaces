import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Play, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CameraPreview } from '@/features/round/camera-preview';
import { FaceStatus } from '@/features/round/face-status';
import { ReferenceFace } from '@/features/round/reference-face';
import { useCamera } from '@/features/round/use-camera';
import { useFaceLandmarker } from '@/features/round/use-face-landmarker';
import { useRoundTimer } from '@/features/round/use-round-timer';
import {
  extractFeatures,
  pointsForScore,
  scoreRound,
} from '@/features/round/scoring';
import type { FrameSample, RoundPhase } from '@/features/round/types';
import { useLeaderboardStore } from '@/features/leaderboard/use-leaderboard-store';

const ROUND_SECONDS = 10;
const COUNTDOWN_SECONDS = 3;
const SAMPLE_INTERVAL_MS = 100;

export function PlayPage() {
  const navigate = useNavigate();
  const player = useLeaderboardStore((s) => s.player);
  const addResult = useLeaderboardStore((s) => s.addResult);

  const [phase, setPhase] = useState<RoundPhase>('permission');
  const [countdown, setCountdown] = useState<number>(COUNTDOWN_SECONDS);
  const [faceDetected, setFaceDetected] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  const camera = useCamera({ width: 640, height: 480 });
  const landmarker = useFaceLandmarker();

  const samplesRef = useRef<FrameSample[]>([]);
  const samplerRef = useRef<number | null>(null);
  const countdownRef = useRef<number | null>(null);

  const onComplete = useCallback(() => {
    setPhase('scoring');
  }, []);

  const timer = useRoundTimer(ROUND_SECONDS, onComplete);

  useEffect(() => {
    if (!player) navigate('/', { replace: true });
  }, [player, navigate]);

  const sampleFrame = useCallback(() => {
    const video = camera.videoRef.current;
    if (!video) return;
    const ts = performance.now();
    const result = landmarker.detect(video, ts);
    const lm = result?.faceLandmarks?.[0];
    if (!lm || lm.length === 0) {
      samplesRef.current.push({ timestamp: ts, detected: false, features: null });
      setFaceDetected(false);
      setHint('Move your face into the frame');
      return;
    }
    const features = extractFeatures(lm);
    samplesRef.current.push({
      timestamp: ts,
      detected: features != null,
      features,
    });
    setFaceDetected(features != null);
    if (features) {
      setHint(features.mouthWidthRatio < 0.45 ? 'Wider grin!' : null);
    }
  }, [camera.videoRef, landmarker]);

  const startSampling = useCallback(() => {
    samplesRef.current = [];
    if (samplerRef.current) window.clearInterval(samplerRef.current);
    samplerRef.current = window.setInterval(sampleFrame, SAMPLE_INTERVAL_MS);
  }, [sampleFrame]);

  const stopSampling = useCallback(() => {
    if (samplerRef.current) {
      window.clearInterval(samplerRef.current);
      samplerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopSampling();
      if (countdownRef.current) window.clearInterval(countdownRef.current);
    };
  }, [stopSampling]);

  const handleRequestCamera = async () => {
    await camera.request();
  };

  useEffect(() => {
    if (
      phase === 'permission' &&
      camera.status === 'granted' &&
      landmarker.status === 'ready'
    ) {
      setPhase('ready');
    }
  }, [phase, camera.status, landmarker.status]);

  const handleStartRound = () => {
    if (phase !== 'ready') return;
    setPhase('countdown');
    setCountdown(COUNTDOWN_SECONDS);
    let n = COUNTDOWN_SECONDS;
    countdownRef.current = window.setInterval(() => {
      n -= 1;
      if (n <= 0) {
        if (countdownRef.current) window.clearInterval(countdownRef.current);
        countdownRef.current = null;
        setPhase('running');
        startSampling();
        timer.start();
      } else {
        setCountdown(n);
      }
    }, 1000);
  };

  useEffect(() => {
    if (phase !== 'scoring') return;
    stopSampling();
    const t = window.setTimeout(() => {
      const out = scoreRound({ samples: samplesRef.current });
      const points = pointsForScore(out.score);
      const result = addResult({
        score: out.score,
        pointsAwarded: points,
        detectionRate: out.detectionRate,
        meta: {
          framesSampled: out.framesSampled,
          framesWithFace: out.framesWithFace,
          avgFeatures: out.avgFeatures ?? undefined,
        },
      });
      camera.stop();
      navigate(`/results/${result.id}`, { replace: true });
    }, 800);
    return () => window.clearTimeout(t);
  }, [phase, addResult, camera, navigate, stopSampling]);

  const timerPct = useMemo(
    () => ((ROUND_SECONDS - timer.remaining) / ROUND_SECONDS) * 100,
    [timer.remaining],
  );

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Hi {player?.displayName} —
          </h1>
          <p className="text-sm text-muted-foreground">
            Match the troll face. You have {ROUND_SECONDS} seconds.
          </p>
        </div>
        <ReferenceFace size="sm" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr,1fr]">
        <CameraPreview
          videoRef={camera.videoRef}
          overlay={<RoundOverlay phase={phase} countdown={countdown} />}
        />

        <Card>
          <CardContent className="flex flex-col gap-4 p-6">
            <FaceStatus
              detected={faceDetected && phase === 'running'}
              hint={phase === 'running' ? hint : null}
            />

            <div className="flex flex-col gap-2">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium">Time left</span>
                <span className="font-mono text-xl tabular-nums">
                  {phase === 'running'
                    ? timer.remaining.toFixed(1)
                    : phase === 'scoring'
                    ? '0.0'
                    : ROUND_SECONDS.toFixed(1)}
                  s
                </span>
              </div>
              <Progress
                value={phase === 'running' ? timerPct : phase === 'scoring' ? 100 : 0}
              />
            </div>

            <PhaseControls
              phase={phase}
              cameraStatus={camera.status}
              cameraError={camera.error}
              landmarkerStatus={landmarker.status}
              landmarkerError={landmarker.error}
              onRequestCamera={handleRequestCamera}
              onStart={handleStartRound}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function RoundOverlay({
  phase,
  countdown,
}: {
  phase: RoundPhase;
  countdown: number;
}) {
  if (phase === 'countdown') {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/30 text-white">
        <span className="text-8xl font-bold tabular-nums drop-shadow-lg">
          {countdown}
        </span>
      </div>
    );
  }
  if (phase === 'scoring') {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/40 text-white">
        <Sparkles className="h-8 w-8 animate-pulse" />
        <span className="text-xl font-semibold">Scanning…</span>
      </div>
    );
  }
  return null;
}

interface PhaseControlsProps {
  phase: RoundPhase;
  cameraStatus: ReturnType<typeof useCamera>['status'];
  cameraError: string | null;
  landmarkerStatus: ReturnType<typeof useFaceLandmarker>['status'];
  landmarkerError: string | null;
  onRequestCamera: () => void;
  onStart: () => void;
}

function PhaseControls({
  phase,
  cameraStatus,
  cameraError,
  landmarkerStatus,
  landmarkerError,
  onRequestCamera,
  onStart,
}: PhaseControlsProps) {
  if (phase === 'permission') {
    if (cameraStatus === 'denied' || cameraStatus === 'error') {
      return (
        <div className="flex flex-col gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm">
          <p className="font-medium text-destructive">
            Camera unavailable
          </p>
          <p className="text-destructive/80">{cameraError}</p>
          <Button variant="outline" onClick={onRequestCamera}>
            Try again
          </Button>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-2">
        <Button
          size="lg"
          onClick={onRequestCamera}
          disabled={cameraStatus === 'requesting'}
        >
          {cameraStatus === 'requesting' ? (
            <>
              <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Requesting…
            </>
          ) : (
            'Allow camera'
          )}
        </Button>
        <p className="text-xs text-muted-foreground">
          Frames are processed only on your device.
        </p>
        {landmarkerStatus === 'loading' && (
          <p className="text-xs text-muted-foreground">
            Loading face model…
          </p>
        )}
        {landmarkerStatus === 'error' && (
          <p className="text-xs text-destructive">
            Face model failed: {landmarkerError}
          </p>
        )}
      </div>
    );
  }

  if (phase === 'ready') {
    return (
      <Button size="lg" onClick={onStart}>
        <Play className="mr-1 h-4 w-4" /> Start 10s round
      </Button>
    );
  }

  if (phase === 'countdown') {
    return (
      <Button size="lg" disabled>
        Get ready…
      </Button>
    );
  }

  if (phase === 'running') {
    return (
      <Button size="lg" disabled className="cursor-not-allowed">
        <Sparkles className="mr-1 h-4 w-4" /> Show that face!
      </Button>
    );
  }

  return (
    <Button size="lg" disabled>
      <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Scoring…
    </Button>
  );
}
