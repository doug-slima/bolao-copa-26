export interface Team {
  id: string;
  name: string;
  code: string;
  flag: string;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  date: Date;
  stage: "group" | "round16" | "quarter" | "semi" | "third" | "final";
  group?: string;
  venue: string;
  city: string;
  status: "scheduled" | "live" | "finished";
  score?: {
    home: number;
    away: number;
  };
}

export type FirstToScore = "home" | "away" | "none";
export type MatchResult = "home" | "away" | "draw";

export interface PredictionPoints {
  exactScore: number;
  result: number;
  firstToScore: number;
  total: number;
}

export interface PredictionUniqueness {
  exactScore: boolean;
  result: boolean;
  firstToScore: boolean;
}

export interface Prediction {
  id: string;
  matchId: string;
  userId: string;
  
  homeScore: number;
  awayScore: number;
  firstToScore: FirstToScore;
  
  createdAt: Date;
  updatedAt?: Date;
  lockedAt?: Date;
  
  points?: PredictionPoints;
  isUnique?: PredictionUniqueness;
}

export interface UserRanking {
  userId: string;
  userName: string;
  avatarUrl?: string;
  totalPoints: number;
  exactPredictions: number;
  correctResults: number;
  correctFirstScorers: number;
  totalPredictions: number;
  position: number;
}

export interface UserStats {
  totalPredictions: number;
  totalPoints: number;
  exactPredictions: number;
  correctResults: number;
  correctFirstScorers: number;
  wrongPredictions: number;
  pendingPredictions: number;
}

export interface TeamStanding {
  position: number;
  team: Team;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  percentage: number;
  recentResults: ("W" | "D" | "L")[];
}

export interface GroupStanding {
  name: string;
  standings: TeamStanding[];
}

export type ChallengeStatus = "pending" | "accepted" | "declined" | "completed";
export type ChallengeWinner = "challenger" | "challenged" | "tie" | "void";

export interface Challenge {
  id: string;
  matchId: string;
  challengerId: string;
  challengerName: string;
  challengedId: string;
  challengedName: string;
  status: ChallengeStatus;
  createdAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  result?: {
    challengerPoints: number;
    challengedPoints: number;
    winner: ChallengeWinner;
  };
}

export type RankingMovement = "up" | "down" | "same" | "new";

export interface UserRankingExtended extends UserRanking {
  movement: RankingMovement;
  positionChange: number;
  challengeWins: number;
  challengeLosses: number;
  currentStreak: number;
  uniqueExactPredictions: number;
  closeCallMisses: number;
}

export interface UserMetrics {
  userId: string;
  userName: string;
  avatarUrl?: string;
  position: number;
  previousPosition: number;
  totalPoints: number;
  pointsThisWeek: number;
  exactPredictions: number;
  uniqueExactPredictions: number;
  correctResults: number;
  correctFirstScorers: number;
  totalPredictions: number;
  challengeWins: number;
  challengeLosses: number;
  currentStreak: number;
  bestStreak: number;
  closeCallMisses: number;
  pointsBreakdown: {
    fromExactScores: number;
    fromResults: number;
    fromFirstScorer: number;
    fromChallenges: number;
  };
  positionHistory: { date: string; position: number }[];
}

export interface League {
  id: string;
  name: string;
  description?: string;
  inviteCode: string;
  createdBy: string;
  createdByName: string;
  memberCount: number;
  createdAt: Date;
}

export interface LeagueRanking {
  league: League;
  rankings: UserRankingExtended[];
}

export interface MetricLeader {
  userId: string;
  userName: string;
  avatarUrl?: string;
  value: number;
  label?: string;
}
