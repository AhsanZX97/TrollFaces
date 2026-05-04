export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  totalPoints: number;
  bestScore: number;
  rounds: number;
  earliestAchievedAt: number;
}
