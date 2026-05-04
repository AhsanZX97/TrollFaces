export interface FaceFeatures {
  mouthWidthRatio: number;
  mouthAspectRatio: number;
  smileCurvature: number;
  leftEyeOpenness: number;
  rightEyeOpenness: number;
  eyebrowRaise: number;
  jawTension: number;
}

export interface FrameSample {
  timestamp: number;
  detected: boolean;
  features: FaceFeatures | null;
}

export type RoundPhase =
  | 'idle'
  | 'permission'
  | 'ready'
  | 'countdown'
  | 'running'
  | 'scoring'
  | 'done'
  | 'error';

export interface RoundResult {
  id: string;
  playerId: string;
  playerName: string;
  score: number;
  pointsAwarded: number;
  detectionRate: number;
  createdAt: number;
  meta: {
    framesSampled: number;
    framesWithFace: number;
    avgFeatures?: FaceFeatures;
  };
}
