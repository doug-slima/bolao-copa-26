import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-server";

const CreateChallengeSchema = z.object({
  matchId: z.string().min(1),
  challengedId: z.string().min(1),
  challengedName: z.string().min(1),
});

const UpdateChallengeSchema = z.object({
  challengeId: z.string().uuid(),
  action: z.enum(["accept", "decline"]),
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
    const validation = CreateChallengeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Dados inválidos", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { matchId, challengedId, challengedName } = validation.data;

    if (userId === challengedId) {
      return NextResponse.json(
        { success: false, error: "Você não pode desafiar a si mesmo." },
        { status: 400 }
      );
    }

    const { data: existingChallenge } = await supabaseAdmin
      .from("challenges")
      .select("id")
      .eq("match_id", matchId)
      .or(`challenger_id.eq.${userId},challenged_id.eq.${userId}`)
      .in("status", ["pending", "accepted"])
      .single();

    if (existingChallenge) {
      return NextResponse.json(
        { success: false, error: "Você já tem um desafio ativo para este jogo." },
        { status: 400 }
      );
    }

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("name")
      .eq("clerk_id", userId)
      .single();

    const challengerName = user?.name || "Usuário";

    const { data, error } = await supabaseAdmin
      .from("challenges")
      .insert({
        match_id: matchId,
        challenger_id: userId,
        challenger_name: challengerName,
        challenged_id: challengedId,
        challenged_name: challengedName,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating challenge:", error);
      return NextResponse.json(
        { success: false, error: "Erro ao criar desafio." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, challenge: data });
  } catch (error) {
    console.error("Challenge API error:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Não autorizado" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = UpdateChallengeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Dados inválidos", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { challengeId, action } = validation.data;

    const { data: challenge } = await supabaseAdmin
      .from("challenges")
      .select("*")
      .eq("id", challengeId)
      .single();

    if (!challenge) {
      return NextResponse.json(
        { success: false, error: "Desafio não encontrado." },
        { status: 404 }
      );
    }

    if (challenge.challenged_id !== userId) {
      return NextResponse.json(
        { success: false, error: "Você não pode aceitar/recusar este desafio." },
        { status: 403 }
      );
    }

    if (challenge.status !== "pending") {
      return NextResponse.json(
        { success: false, error: "Este desafio já foi respondido." },
        { status: 400 }
      );
    }

    const newStatus = action === "accept" ? "accepted" : "declined";
    const updateData: Record<string, unknown> = { status: newStatus };
    
    if (action === "accept") {
      updateData.accepted_at = new Date().toISOString();
    }

    const { data, error } = await supabaseAdmin
      .from("challenges")
      .update(updateData)
      .eq("id", challengeId)
      .select()
      .single();

    if (error) {
      console.error("Error updating challenge:", error);
      return NextResponse.json(
        { success: false, error: "Erro ao atualizar desafio." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, challenge: data });
  } catch (error) {
    console.error("Challenge PATCH API error:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
