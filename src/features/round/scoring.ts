import type { FaceFeatures, FrameSample } from './types';

/**
 * MediaPipe FaceLandmarker indices we rely on.
 * Picked from the canonical 468-point face mesh topology.
 */
const LM = {
  mouthLeft: 61,
  mouthRight: 291,
  mouthTop: 13,
  mouthBottom: 14,
  mouthCornerLeft: 78,
  mouthCornerRight: 308,
  upperLipCenter: 0,
  leftEyeTop: 159,
  leftEyeBottom: 145,
  leftEyeOuter: 33,
  leftEyeInner: 133,
  rightEyeTop: 386,
  rightEyeBottom: 374,
  rightEyeOuter: 263,
  rightEyeInner: 362,
  leftBrowInner: 65,
  rightBrowInner: 295,
  noseTip: 1,
  chin: 152,
  faceLeft: 234,
  faceRight: 454,
  forehead: 10,
} as const;

interface Pt {
  x: number;
  y: number;
}

function dist(a: Pt, b: Pt) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Convert a flat array of normalized landmarks into compact features
 * that capture the visual "troll face" cues:
 * - very wide grin (mouthWidthRatio ↑)
 * - thin lips, lips pressed (mouthAspectRatio ↓)
 * - upturned mouth corners (smileCurvature ↑)
 * - squinted eyes (eyeOpenness ↓)
 */
export function extractFeatures(landmarks: Pt[]): FaceFeatures | null {
  if (!landmarks || landmarks.length < 468) return null;

  const faceWidth = dist(landmarks[LM.faceLeft], landmarks[LM.faceRight]);
  const faceHeight = dist(landmarks[LM.forehead], landmarks[LM.chin]);
  if (faceWidth <= 0 || faceHeight <= 0) return null;

  const mouthWidth = dist(landmarks[LM.mouthLeft], landmarks[LM.mouthRight]);
  const mouthHeight = dist(landmarks[LM.mouthTop], landmarks[LM.mouthBottom]);
  const mouthWidthRatio = mouthWidth / faceWidth;
  const mouthAspectRatio = mouthHeight / Math.max(mouthWidth, 1e-6);

  const upperLip = landmarks[LM.upperLipCenter];
  const leftCorner = landmarks[LM.mouthCornerLeft];
  const rightCorner = landmarks[LM.mouthCornerRight];
  const cornerAvgY = (leftCorner.y + rightCorner.y) / 2;
  const smileCurvature = (upperLip.y - cornerAvgY) / faceHeight;

  const leftEyeH = dist(landmarks[LM.leftEyeTop], landmarks[LM.leftEyeBottom]);
  const leftEyeW = dist(landmarks[LM.leftEyeOuter], landmarks[LM.leftEyeInner]);
  const rightEyeH = dist(
    landmarks[LM.rightEyeTop],
    landmarks[LM.rightEyeBottom],
  );
  const rightEyeW = dist(
    landmarks[LM.rightEyeOuter],
    landmarks[LM.rightEyeInner],
  );
  const leftEyeOpenness = leftEyeH / Math.max(leftEyeW, 1e-6);
  const rightEyeOpenness = rightEyeH / Math.max(rightEyeW, 1e-6);

  const browAvgY =
    (landmarks[LM.leftBrowInner].y + landmarks[LM.rightBrowInner].y) / 2;
  const eyeAvgY =
    (landmarks[LM.leftEyeTop].y + landmarks[LM.rightEyeTop].y) / 2;
  const eyebrowRaise = (eyeAvgY - browAvgY) / faceHeight;

  const jawTension =
    dist(landmarks[LM.chin], landmarks[LM.noseTip]) / faceHeight;

  return {
    mouthWidthRatio,
    mouthAspectRatio,
    smileCurvature,
    leftEyeOpenness,
    rightEyeOpenness,
    eyebrowRaise,
    jawTension,
  };
}

/**
 * Reference feature vector that approximates the meme troll face:
 * very wide closed-lip grin, mildly squinted eyes, slightly furrowed brow.
 * Values are normalized (face-width / face-height relative).
 */
export const REFERENCE_TROLL_FEATURES: FaceFeatures = {
  mouthWidthRatio: 0.62,
  mouthAspectRatio: 0.04,
  smileCurvature: 0.07,
  leftEyeOpenness: 0.18,
  rightEyeOpenness: 0.18,
  eyebrowRaise: 0.06,
  jawTension: 0.62,
};

/** Per-feature weight: how much each cue contributes to the score. */
const FEATURE_WEIGHTS: Record<keyof FaceFeatures, number> = {
  mouthWidthRatio: 1.6,
  mouthAspectRatio: 0.9,
  smileCurvature: 1.4,
  leftEyeOpenness: 1.0,
  rightEyeOpenness: 1.0,
  eyebrowRaise: 0.6,
  jawTension: 0.4,
};

/** Tolerances per feature (~ "how close is close"). */
const FEATURE_TOLERANCE: Record<keyof FaceFeatures, number> = {
  mouthWidthRatio: 0.18,
  mouthAspectRatio: 0.08,
  smileCurvature: 0.08,
  leftEyeOpenness: 0.18,
  rightEyeOpenness: 0.18,
  eyebrowRaise: 0.08,
  jawTension: 0.15,
};

/**
 * Score a single feature set vs the troll reference.
 * Returns a value in [0, 1] where 1 is perfect.
 */
export function similarity(
  features: FaceFeatures,
  reference: FaceFeatures = REFERENCE_TROLL_FEATURES,
): number {
  let totalWeight = 0;
  let totalScore = 0;
  (Object.keys(reference) as (keyof FaceFeatures)[]).forEach((key) => {
    const weight = FEATURE_WEIGHTS[key];
    const tol = FEATURE_TOLERANCE[key];
    const diff = Math.abs(features[key] - reference[key]);
    const featureScore = Math.exp(-(diff * diff) / (2 * tol * tol));
    totalScore += featureScore * weight;
    totalWeight += weight;
  });
  return totalWeight > 0 ? totalScore / totalWeight : 0;
}

export interface RoundScoreInput {
  samples: FrameSample[];
  minDetectionRate?: number;
}

export interface RoundScoreOutput {
  score: number;
  detectionRate: number;
  framesSampled: number;
  framesWithFace: number;
  avgFeatures: FaceFeatures | null;
  reason?: 'no-face' | 'low-detection';
}

const DEFAULT_MIN_DETECTION_RATE = 0.7;

/**
 * Aggregate frame samples into a 0–100 round score.
 * - If detection rate < min, returns 0 with reason.
 * - Else returns the 80th-percentile single-frame similarity (rewards the
 *   player's best stretch, not a one-frame fluke).
 */
export function scoreRound({
  samples,
  minDetectionRate = DEFAULT_MIN_DETECTION_RATE,
}: RoundScoreInput): RoundScoreOutput {
  const framesSampled = samples.length;
  const detected = samples.filter((s) => s.detected && s.features);
  const framesWithFace = detected.length;
  const detectionRate =
    framesSampled > 0 ? framesWithFace / framesSampled : 0;

  if (framesSampled === 0 || framesWithFace === 0) {
    return {
      score: 0,
      detectionRate: 0,
      framesSampled,
      framesWithFace,
      avgFeatures: null,
      reason: 'no-face',
    };
  }

  if (detectionRate < minDetectionRate) {
    return {
      score: 0,
      detectionRate,
      framesSampled,
      framesWithFace,
      avgFeatures: averageFeatures(detected),
      reason: 'low-detection',
    };
  }

  const sims = detected
    .map((s) => similarity(s.features as FaceFeatures))
    .sort((a, b) => a - b);
  const idx = Math.floor(sims.length * 0.8);
  const best = sims[Math.min(idx, sims.length - 1)];

  return {
    score: Math.round(best * 100),
    detectionRate,
    framesSampled,
    framesWithFace,
    avgFeatures: averageFeatures(detected),
  };
}

export function averageFeatures(samples: FrameSample[]): FaceFeatures | null {
  const valid = samples
    .map((s) => s.features)
    .filter((f): f is FaceFeatures => f != null);
  if (valid.length === 0) return null;
  const acc: FaceFeatures = {
    mouthWidthRatio: 0,
    mouthAspectRatio: 0,
    smileCurvature: 0,
    leftEyeOpenness: 0,
    rightEyeOpenness: 0,
    eyebrowRaise: 0,
    jawTension: 0,
  };
  valid.forEach((f) => {
    (Object.keys(acc) as (keyof FaceFeatures)[]).forEach((k) => {
      acc[k] += f[k];
    });
  });
  (Object.keys(acc) as (keyof FaceFeatures)[]).forEach((k) => {
    acc[k] /= valid.length;
  });
  return acc;
}

export function pointsForScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}
