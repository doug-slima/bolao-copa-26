import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-server";
import {
  calculatePoints,
  getMatchResult,
  isExactScoreCorrect,
  isResultCorrect,
  POINTS,
} from "@/lib/scoring";
import type { Prediction, Match, FirstToScore } from "@/types";

const ScoringSchema = z.object({
  matchId: z.string().min(1),
  homeScore: z.number().int().min(0),
  awayScore: z.number().int().min(0),
  firstToScore: z.enum(["home", "away", "none"]),
});

const API_SECRET = process.env.SCORING_API_SECRET;

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (API_SECRET && authHeader !== `Bearer ${API_SECRET}`) {
      return NextResponse.json(
        { success: false, error: "Não autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = ScoringSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Dados inválidos", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { matchId, homeScore, awayScore, firstToScore } = validation.data;

    const { data: predictions, error: fetchError } = await supabaseAdmin
      .from("predictions")
      .select("*")
      .eq("match_id", matchId);

    if (fetchError) {
      console.error("Error fetching predictions:", fetchError);
      return NextResponse.json(
        { success: false, error: "Erro ao buscar palpites" },
        { status: 500 }
      );
    }

    if (!predictions || predictions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "Nenhum palpite encontrado para este jogo",
        scored: 0,
      });
    }

    const match: Match = {
      id: matchId,
      homeTeam: { id: "", name: "", code: "", flag: "" },
      awayTeam: { id: "", name: "", code: "", flag: "" },
      date: new Date(),
      stage: "group",
      venue: "",
      city: "",
      status: "finished",
      score: { home: homeScore, away: awayScore },
    };

    const typedPredictions: Prediction[] = predictions.map((p) => ({
      id: p.id,
      matchId: p.match_id,
      userId: p.user_id,
      homeScore: p.home_score,
      awayScore: p.away_score,
      firstToScore: p.first_to_score as FirstToScore,
      createdAt: new Date(p.created_at),
      updatedAt: p.updated_at ? new Date(p.updated_at) : undefined,
    }));

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

    for (const prediction of typedPredictions) {
      const { points, isUnique } = calculatePoints(prediction, match, typedPredictions, firstToScore);
      
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
      const { error: updateError } = await supabaseAdmin
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

      if (updateError) {
        console.error(`Error updating prediction ${update.id}:`, updateError);
      }
    }

    const userIds = [...new Set(updates.map((u) => u.userId))];
    const userStatsUpdated: string[] = [];

    for (const userId of userIds) {
      const { data: userPredictions, error: userPredError } = await supabaseAdmin
        .from("predictions")
        .select("points_exact_score, points_result, points_first_scorer, points_total, home_score, away_score")
        .eq("user_id", userId)
        .not("points_total", "is", null);

      if (userPredError || !userPredictions) {
        console.error(`Error fetching predictions for user ${userId}:`, userPredError);
        continue;
      }

      let totalPoints = 0;
      let exactPredictions = 0;
      let correctResults = 0;
      let correctFirstScorers = 0;

      for (const pred of userPredictions) {
        totalPoints += pred.points_total || 0;
        if (pred.points_exact_score > 0) exactPredictions++;
        if (pred.points_result > 0) correctResults++;
        if (pred.points_first_scorer > 0) correctFirstScorers++;
      }

      const { error: userUpdateError } = await supabaseAdmin
        .from("users")
        .update({
          total_points: totalPoints,
          exact_predictions: exactPredictions,
          correct_results: correctResults,
          correct_first_scorers: correctFirstScorers,
          total_predictions: userPredictions.length,
          updated_at: new Date().toISOString(),
        })
        .eq("clerk_id", userId);

      if (userUpdateError) {
        console.error(`Error updating user stats for ${userId}:`, userUpdateError);
      } else {
        userStatsUpdated.push(userId);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Pontuação calculada para ${updates.length} palpites`,
      scored: updates.length,
      usersUpdated: userStatsUpdated.length,
      details: updates.map((u) => ({
        predictionId: u.id,
        userId: u.userId,
        points: u.pointsTotal,
      })),
    });
  } catch (error) {
    console.error("Scoring API error:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (API_SECRET && authHeader !== `Bearer ${API_SECRET}`) {
      return NextResponse.json(
        { success: false, error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get("matchId");

    if (!matchId) {
      return NextResponse.json(
        { success: false, error: "matchId é obrigatório" },
        { status: 400 }
      );
    }

    const { data: predictions, error } = await supabaseAdmin
      .from("predictions")
      .select("id, user_id, user_name, home_score, away_score, points_total, points_exact_score, points_result, points_first_scorer")
      .eq("match_id", matchId)
      .order("points_total", { ascending: false, nullsFirst: false });

    if (error) {
      console.error("Error fetching predictions:", error);
      return NextResponse.json(
        { success: false, error: "Erro ao buscar palpites" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      matchId,
      predictions: predictions || [],
      total: predictions?.length || 0,
      scored: predictions?.filter((p) => p.points_total !== null).length || 0,
    });
  } catch (error) {
    console.error("Scoring GET API error:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
