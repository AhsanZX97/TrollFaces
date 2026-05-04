import { describe, expect, it } from 'vitest';
import {
  REFERENCE_TROLL_FEATURES,
  pointsForScore,
  scoreRound,
  similarity,
} from './scoring';
import type { FaceFeatures, FrameSample } from './types';

const sample = (
  detected: boolean,
  features: FaceFeatures | null,
  timestamp = 0,
): FrameSample => ({ detected, features, timestamp });

describe('similarity', () => {
  it('returns ~1 for the reference features', () => {
    const s = similarity(REFERENCE_TROLL_FEATURES);
    expect(s).toBeGreaterThan(0.99);
  });

  it('returns a much lower score for a clearly non-troll face', () => {
    const surprised: FaceFeatures = {
      mouthWidthRatio: 0.32,
      mouthAspectRatio: 0.55,
      smileCurvature: -0.04,
      leftEyeOpenness: 0.5,
      rightEyeOpenness: 0.5,
      eyebrowRaise: 0.12,
      jawTension: 0.55,
    };
    const s = similarity(surprised);
    expect(s).toBeLessThan(0.4);
  });
});

describe('scoreRound', () => {
  it('returns 0 with reason "no-face" when nothing was detected', () => {
    const result = scoreRound({
      samples: Array.from({ length: 10 }, (_, i) => sample(false, null, i)),
    });
    expect(result.score).toBe(0);
    expect(result.reason).toBe('no-face');
  });

  it('returns 0 with reason "low-detection" below threshold', () => {
    const samples: FrameSample[] = [
      ...Array.from({ length: 4 }, (_, i) =>
        sample(true, REFERENCE_TROLL_FEATURES, i),
      ),
      ...Array.from({ length: 6 }, (_, i) => sample(false, null, 4 + i)),
    ];
    const result = scoreRound({ samples });
    expect(result.score).toBe(0);
    expect(result.reason).toBe('low-detection');
  });

  it('produces a high score when most frames match the reference', () => {
    const samples: FrameSample[] = Array.from({ length: 10 }, (_, i) =>
      sample(true, REFERENCE_TROLL_FEATURES, i),
    );
    const result = scoreRound({ samples });
    expect(result.score).toBeGreaterThan(95);
    expect(result.detectionRate).toBe(1);
    expect(result.framesWithFace).toBe(10);
  });
});

describe('pointsForScore', () => {
  it('clamps values to 0–100 and rounds', () => {
    expect(pointsForScore(72.4)).toBe(72);
    expect(pointsForScore(-3)).toBe(0);
    expect(pointsForScore(120)).toBe(100);
  });
});
