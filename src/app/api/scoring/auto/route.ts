import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import { getAllMatches } from "@/lib/api";
import { calculatePoints } from "@/lib/scoring";
import type { Prediction, Match, FirstToScore } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(_request: NextRequest) {
  try {
    const matches = await getAllMatches();
    const finishedMatches = matches.filter(
      (m) => m.status === "finished" && m.score
    );

    if (finishedMatches.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Nenhum jogo finalizado encontrado",
        scored: 0,
      });
    }

    const matchIds = finishedMatches.map((m) => m.id);

    const { data: unscoredPredictions, error: fetchError } = await supabaseAdmin
      .from("predictions")
      .select("match_id")
      .in("match_id", matchIds)
      .is("points_total", null);

    if (fetchError) {
      console.error("Error fetching unscored predictions:", fetchError);
      return NextResponse.json(
        { success: false, error: "Erro ao buscar palpites" },
        { status: 500 }
      );
    }

    const matchesWithUnscoredPredictions = [
      ...new Set(unscoredPredictions?.map((p) => p.match_id) || []),
    ];

    if (matchesWithUnscoredPredictions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Todos os palpites já foram pontuados",
        scored: 0,
      });
    }

    let totalScored = 0;
    const scoredMatches: string[] = [];
    const errors: string[] = [];

    for (const matchId of matchesWithUnscoredPredictions) {
      const match = finishedMatches.find((m) => m.id === matchId);
      if (!match || !match.score) continue;

      try {
        const result = await scoreMatch(match);
        totalScored += result.scored;
        scoredMatches.push(matchId);
      } catch (err) {
        console.error(`Error scoring match ${matchId}:`, err);
        errors.push(matchId);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Pontuação calculada para ${totalScored} palpites em ${scoredMatches.length} jogos`,
      totalScored,
      matchesScored: scoredMatches,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Auto-scoring error:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

async function scoreMatch(match: Match): Promise<{ scored: number }> {
  if (!match.score) {
    throw new Error("Match has no score");
  }

  const { data: predictions, error: fetchError } = await supabaseAdmin
    .from("predictions")
    .select("*")
    .eq("match_id", match.id)
    .is("points_total", null);

  if (fetchError) {
    throw new Error(`Failed to fetch predictions: ${fetchError.message}`);
  }

  if (!predictions || predictions.length === 0) {
    return { scored: 0 };
  }

  const { data: allMatchPredictions } = await supabaseAdmin
    .from("predictions")
    .select("*")
    .eq("match_id", match.id);

  const typedPredictions: Prediction[] = (allMatchPredictions || []).map((p) => ({
    id: p.id,
    matchId: p.match_id,
    userId: p.user_id,
    homeScore: p.home_score,
    awayScore: p.away_score,
    firstToScore: p.first_to_score as FirstToScore,
    createdAt: new Date(p.created_at),
    updatedAt: p.updated_at ? new Date(p.updated_at) : undefined,
  }));

  const firstToScore = determineFirstToScore(match);

  const updates: Array<{
    id: string;
    userId: string;
    pointsExactScore: number;
    pointsResult: number;
    pointsFirstScorer: number;
    pointsTotal: number;
    isUniqueExact: boolean;
    isUniqueResult: boolean;
    isUniqueFirstScorer: boolean;
  }> = [];

  for (const pred of predictions) {
    const prediction = typedPredictions.find((p) => p.id === pred.id);
    if (!prediction) continue;

    const { points, isUnique } = calculatePoints(
      prediction,
      match,
      typedPredictions,
      firstToScore
    );

    updates.push({
      id: prediction.id,
      userId: prediction.userId,
      pointsExactScore: points.exactScore,
      pointsResult: points.result,
      pointsFirstScorer: points.firstToScore,
      pointsTotal: points.total,
      isUniqueExact: isUnique.exactScore,
      isUniqueResult: isUnique.result,
      isUniqueFirstScorer: isUnique.firstToScore,
    });
  }

  for (const update of updates) {
    await supabaseAdmin
      .from("predictions")
      .update({
        points_exact_score: update.pointsExactScore,
        points_result: update.pointsResult,
        points_first_scorer: update.pointsFirstScorer,
        points_total: update.pointsTotal,
        is_unique_exact: update.isUniqueExact,
        is_unique_result: update.isUniqueResult,
        is_unique_first_scorer: update.isUniqueFirstScorer,
      })
      .eq("id", update.id);
  }

  const userIds = [...new Set(updates.map((u) => u.userId))];
  for (const userId of userIds) {
    await recalculateUserStats(userId);
  }

  return { scored: updates.length };
}

function determineFirstToScore(match: Match): FirstToScore {
  if (!match.score) return "none";
  if (match.score.home === 0 && match.score.away === 0) return "none";
  if (match.score.home > 0 && match.score.away === 0) return "home";
  if (match.score.away > 0 && match.score.home === 0) return "away";
  return "none";
}

async function recalculateUserStats(userId: string): Promise<void> {
  const { data: predictions } = await supabaseAdmin
    .from("predictions")
    .select("points_exact_score, points_result, points_first_scorer, points_total")
    .eq("user_id", userId);

  let totalPoints = 0;
  let exactPredictions = 0;
  let correctResults = 0;
  let correctFirstScorers = 0;
  let totalPredictionCount = 0;

  for (const pred of predictions || []) {
    totalPredictionCount++;
    if (pred.points_total !== null) {
      totalPoints += pred.points_total || 0;
      if (pred.points_exact_score > 0) exactPredictions++;
      if (pred.points_result > 0) correctResults++;
      if (pred.points_first_scorer > 0) correctFirstScorers++;
    }
  }

  await supabaseAdmin
    .from("users")
    .update({
      total_points: totalPoints,
      exact_predictions: exactPredictions,
      correct_results: correctResults,
      correct_first_scorers: correctFirstScorers,
      total_predictions: totalPredictionCount,
      updated_at: new Date().toISOString(),
    })
    .eq("clerk_id", userId);
}
