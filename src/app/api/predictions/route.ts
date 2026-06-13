import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-server";

const PredictionSchema = z.object({
  matchId: z.string().min(1),
  homeScore: z.number().int().min(0).max(99),
  awayScore: z.number().int().min(0).max(99),
  firstToScore: z.enum(["home", "away", "none"]),
  matchDate: z.string().datetime(),
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Não autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = PredictionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Dados inválidos", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { matchId, homeScore, awayScore, firstToScore, matchDate } = validation.data;

    const deadline = new Date(matchDate);
    deadline.setMinutes(deadline.getMinutes() - 5);
    
    if (new Date() > deadline) {
      return NextResponse.json(
        { success: false, error: "O prazo para chutes neste jogo já encerrou." },
        { status: 400 }
      );
    }

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("name, avatar_url")
      .eq("clerk_id", userId)
      .single();

    const userName = user?.name || "Usuário";
    const userAvatarUrl = user?.avatar_url || null;

    const { data: existing } = await supabaseAdmin
      .from("predictions")
      .select("id")
      .eq("match_id", matchId)
      .eq("user_id", userId)
      .single();

    if (existing) {
      const { data, error } = await supabaseAdmin
        .from("predictions")
        .update({
          home_score: homeScore,
          away_score: awayScore,
          first_to_score: firstToScore,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating prediction:", error);
        return NextResponse.json(
          { success: false, error: "Erro ao atualizar chute." },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, prediction: data });
    }

    const { data, error } = await supabaseAdmin
      .from("predictions")
      .insert({
        match_id: matchId,
        user_id: userId,
        user_name: userName,
        user_avatar_url: userAvatarUrl,
        home_score: homeScore,
        away_score: awayScore,
        first_to_score: firstToScore,
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving prediction:", error);
      return NextResponse.json(
        { success: false, error: "Erro ao salvar chute." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, prediction: data });
  } catch (error) {
    console.error("Prediction API error:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get("matchId");
    const matchDate = searchParams.get("matchDate");

    if (!matchId || !matchDate) {
      return NextResponse.json(
        { success: false, error: "Parâmetros inválidos" },
        { status: 400 }
      );
    }

    const deadline = new Date(matchDate);
    deadline.setMinutes(deadline.getMinutes() - 5);
    
    if (new Date() > deadline) {
      return NextResponse.json(
        { success: false, error: "O prazo para modificar chutes já encerrou." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("predictions")
      .delete()
      .eq("match_id", matchId)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting prediction:", error);
      return NextResponse.json(
        { success: false, error: "Erro ao remover chute." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Prediction DELETE API error:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
