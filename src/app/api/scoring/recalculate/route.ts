import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

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

    const body = await request.json().catch(() => ({}));
    const userId = body.userId as string | undefined;

    if (userId) {
      const result = await recalculateUserStats(userId);
      return NextResponse.json({
        success: true,
        message: `Stats recalculadas para usuário ${userId}`,
        result,
      });
    }

    const { data: users, error: usersError } = await supabaseAdmin
      .from("users")
      .select("clerk_id");

    if (usersError || !users) {
      console.error("Error fetching users:", usersError);
      return NextResponse.json(
        { success: false, error: "Erro ao buscar usuários" },
        { status: 500 }
      );
    }

    const results: Array<{ userId: string; success: boolean; totalPoints?: number }> = [];

    for (const user of users) {
      try {
        const result = await recalculateUserStats(user.clerk_id);
        results.push({ userId: user.clerk_id, success: true, totalPoints: result.totalPoints });
      } catch (err) {
        console.error(`Error recalculating stats for ${user.clerk_id}:`, err);
        results.push({ userId: user.clerk_id, success: false });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Stats recalculadas para ${results.filter((r) => r.success).length} usuários`,
      total: users.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    });
  } catch (error) {
    console.error("Recalculate API error:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

async function recalculateUserStats(userId: string): Promise<{
  totalPoints: number;
  exactPredictions: number;
  correctResults: number;
  correctFirstScorers: number;
  totalPredictions: number;
}> {
  const { data: predictions, error } = await supabaseAdmin
    .from("predictions")
    .select("points_exact_score, points_result, points_first_scorer, points_total")
    .eq("user_id", userId);

  if (error) {
    throw new Error(`Failed to fetch predictions: ${error.message}`);
  }

  let totalPoints = 0;
  let exactPredictions = 0;
  let correctResults = 0;
  let correctFirstScorers = 0;
  let scoredPredictions = 0;

  for (const pred of predictions || []) {
    if (pred.points_total !== null) {
      totalPoints += pred.points_total || 0;
      scoredPredictions++;
      if (pred.points_exact_score > 0) exactPredictions++;
      if (pred.points_result > 0) correctResults++;
      if (pred.points_first_scorer > 0) correctFirstScorers++;
    }
  }

  const totalPredictions = predictions?.length || 0;

  const { error: updateError } = await supabaseAdmin
    .from("users")
    .update({
      total_points: totalPoints,
      exact_predictions: exactPredictions,
      correct_results: correctResults,
      correct_first_scorers: correctFirstScorers,
      total_predictions: totalPredictions,
      updated_at: new Date().toISOString(),
    })
    .eq("clerk_id", userId);

  if (updateError) {
    throw new Error(`Failed to update user stats: ${updateError.message}`);
  }

  return {
    totalPoints,
    exactPredictions,
    correctResults,
    correctFirstScorers,
    totalPredictions,
  };
}
