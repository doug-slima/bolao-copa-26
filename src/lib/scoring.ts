import type {
  Match,
  Prediction,
  PredictionPoints,
  PredictionUniqueness,
  MatchResult,
  FirstToScore,
} from "@/types";

export const POINTS = {
  EXACT_SCORE: { unique: 10, shared: 7 },
  RESULT: { unique: 5, shared: 3 },
  FIRST_SCORER: { unique: 2, shared: 1 },
} as const;

export const PREDICTION_DEADLINE_MINUTES = 5;

export function getMatchResult(homeScore: number, awayScore: number): MatchResult {
  if (homeScore > awayScore) return "home";
  if (awayScore > homeScore) return "away";
  return "draw";
}

export function getFirstToScoreFromMatch(match: Match): FirstToScore {
  if (!match.score) return "none";
  if (match.score.home === 0 && match.score.away === 0) return "none";
  
  // If only one team scored, they scored first
  if (match.score.home > 0 && match.score.away === 0) return "home";
  if (match.score.away > 0 && match.score.home === 0) return "away";
  
  // Both teams scored - we can't determine who scored first from final score alone
  // Return "none" to not award points for this category when we can't verify
  return "none";
}

export function isExactScoreCorrect(prediction: Prediction, match: Match): boolean {
  if (!match.score) return false;
  return (
    prediction.homeScore === match.score.home &&
    prediction.awayScore === match.score.away
  );
}

export function isResultCorrect(prediction: Prediction, match: Match): boolean {
  if (!match.score) return false;
  const predictedResult = getMatchResult(prediction.homeScore, prediction.awayScore);
  const actualResult = getMatchResult(match.score.home, match.score.away);
  return predictedResult === actualResult;
}

export function isFirstScorerCorrect(
  prediction: Prediction,
  match: Match,
  actualFirstScorer?: FirstToScore
): boolean {
  if (!match.score) return false;
  
  const firstScorer = actualFirstScorer ?? getFirstToScoreFromMatch(match);
  return prediction.firstToScore === firstScorer;
}

export interface PredictionAnalysis {
  exactScoreCorrect: boolean;
  resultCorrect: boolean;
  firstScorerCorrect: boolean;
  predictedResult: MatchResult;
  predictedScore: string;
}

export function analyzePrediction(
  prediction: Prediction,
  match: Match,
  actualFirstScorer?: FirstToScore
): PredictionAnalysis {
  return {
    exactScoreCorrect: isExactScoreCorrect(prediction, match),
    resultCorrect: isResultCorrect(prediction, match),
    firstScorerCorrect: isFirstScorerCorrect(prediction, match, actualFirstScorer),
    predictedResult: getMatchResult(prediction.homeScore, prediction.awayScore),
    predictedScore: `${prediction.homeScore}x${prediction.awayScore}`,
  };
}

export interface UniquenessAnalysis {
  exactScoreCount: number;
  resultCount: Map<MatchResult, number>;
  firstScorerCount: Map<FirstToScore, number>;
}

export function analyzeUniqueness(predictions: Prediction[]): UniquenessAnalysis {
  const exactScores = new Map<string, number>();
  const results = new Map<MatchResult, number>();
  const firstScorers = new Map<FirstToScore, number>();

  for (const p of predictions) {
    const scoreKey = `${p.homeScore}-${p.awayScore}`;
    exactScores.set(scoreKey, (exactScores.get(scoreKey) || 0) + 1);

    const result = getMatchResult(p.homeScore, p.awayScore);
    results.set(result, (results.get(result) || 0) + 1);

    firstScorers.set(p.firstToScore, (firstScorers.get(p.firstToScore) || 0) + 1);
  }

  return {
    exactScoreCount: exactScores.size,
    resultCount: results,
    firstScorerCount: firstScorers,
  };
}

export function calculatePoints(
  prediction: Prediction,
  match: Match,
  allPredictions: Prediction[],
  actualFirstScorer?: FirstToScore
): { points: PredictionPoints; isUnique: PredictionUniqueness } {
  const analysis = analyzePrediction(prediction, match, actualFirstScorer);
  
  const scoreKey = `${prediction.homeScore}-${prediction.awayScore}`;
  const predictedResult = getMatchResult(prediction.homeScore, prediction.awayScore);
  
  let exactScoreUnique = true;
  let resultUnique = true;
  let firstScorerUnique = true;
  
  for (const p of allPredictions) {
    if (p.id === prediction.id) continue;
    
    const otherScoreKey = `${p.homeScore}-${p.awayScore}`;
    if (otherScoreKey === scoreKey) {
      exactScoreUnique = false;
    }
    
    const otherResult = getMatchResult(p.homeScore, p.awayScore);
    if (otherResult === predictedResult) {
      resultUnique = false;
    }
    
    if (p.firstToScore === prediction.firstToScore) {
      firstScorerUnique = false;
    }
  }

  const exactScorePoints = analysis.exactScoreCorrect
    ? (exactScoreUnique ? POINTS.EXACT_SCORE.unique : POINTS.EXACT_SCORE.shared)
    : 0;
    
  const resultPoints = analysis.resultCorrect
    ? (resultUnique ? POINTS.RESULT.unique : POINTS.RESULT.shared)
    : 0;
    
  const firstScorerPoints = analysis.firstScorerCorrect
    ? (firstScorerUnique ? POINTS.FIRST_SCORER.unique : POINTS.FIRST_SCORER.shared)
    : 0;

  return {
    points: {
      exactScore: exactScorePoints,
      result: resultPoints,
      firstToScore: firstScorerPoints,
      total: exactScorePoints + resultPoints + firstScorerPoints,
    },
    isUnique: {
      exactScore: exactScoreUnique && analysis.exactScoreCorrect,
      result: resultUnique && analysis.resultCorrect,
      firstToScore: firstScorerUnique && analysis.firstScorerCorrect,
    },
  };
}

export function calculateAllPredictionPoints(
  predictions: Prediction[],
  match: Match,
  actualFirstScorer?: FirstToScore
): Prediction[] {
  return predictions.map((prediction) => {
    const { points, isUnique } = calculatePoints(prediction, match, predictions, actualFirstScorer);
    return {
      ...prediction,
      points,
      isUnique,
    };
  });
}

export function isPredictionDeadlinePassed(matchDate: Date): boolean {
  const now = new Date();
  const deadline = new Date(matchDate);
  deadline.setMinutes(deadline.getMinutes() - PREDICTION_DEADLINE_MINUTES);
  return now >= deadline;
}

export function getTimeUntilDeadline(matchDate: Date): {
  isPassed: boolean;
  minutes: number;
  hours: number;
  days: number;
  formatted: string;
} {
  const now = new Date();
  const deadline = new Date(matchDate);
  deadline.setMinutes(deadline.getMinutes() - PREDICTION_DEADLINE_MINUTES);
  
  const diff = deadline.getTime() - now.getTime();
  const isPassed = diff <= 0;
  
  if (isPassed) {
    return { isPassed: true, minutes: 0, hours: 0, days: 0, formatted: "Encerrado" };
  }
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  let formatted: string;
  if (days > 0) {
    formatted = `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    formatted = `${hours}h ${minutes % 60}m`;
  } else {
    formatted = `${minutes}m`;
  }
  
  return { isPassed, minutes, hours, days, formatted };
}

export function getMaxPossiblePoints(): number {
  return (
    POINTS.EXACT_SCORE.unique +
    POINTS.RESULT.unique +
    POINTS.FIRST_SCORER.unique
  );
}

export function getMinPossiblePoints(): number {
  return (
    POINTS.EXACT_SCORE.shared +
    POINTS.RESULT.shared +
    POINTS.FIRST_SCORER.shared
  );
}
