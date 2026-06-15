import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-server";

const CreateChallengeSchema = z.object({
  matchId: z.string().min(1),
  challengedId: z.string().min(1),
  challengedName: z.string().min(1),
  leagueIds: z.array(z.string().uuid()).optional(),
});

const UpdateChallengeSchema = z.object({
  challengeId: z.string().uuid(),
  action: z.enum(["accept", "decline"]),
});

async function getCommonLeagueIds(userId1: string, userId2: string): Promise<string[]> {
  const { data: memberships1 } = await supabaseAdmin
    .from("league_members")
    .select("league_id")
    .eq("user_id", userId1);

  const { data: memberships2 } = await supabaseAdmin
    .from("league_members")
    .select("league_id")
    .eq("user_id", userId2);

  if (!memberships1 || !memberships2) {
    return [];
  }

  const leagues1 = new Set(memberships1.map((m) => m.league_id));
  return memberships2
    .filter((m) => leagues1.has(m.league_id))
    .map((m) => m.league_id);
}

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

    const { matchId, challengedId, challengedName, leagueIds: providedLeagueIds } = validation.data;

    if (userId === challengedId) {
      return NextResponse.json(
        { success: false, error: "Você não pode desafiar a si mesmo." },
        { status: 400 }
      );
    }

    const commonLeagueIds = providedLeagueIds && providedLeagueIds.length > 0
      ? providedLeagueIds
      : await getCommonLeagueIds(userId, challengedId);

    if (commonLeagueIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "Vocês não participam de nenhuma liga em comum." },
        { status: 400 }
      );
    }

    const { data: existingChallenge } = await supabaseAdmin
      .from("challenges")
      .select("id")
      .eq("match_id", matchId)
      .or(`and(challenger_id.eq.${userId},challenged_id.eq.${challengedId}),and(challenger_id.eq.${challengedId},challenged_id.eq.${userId})`)
      .in("status", ["pending", "accepted"])
      .maybeSingle();

    if (existingChallenge) {
      return NextResponse.json(
        { success: false, error: "Você já tem um desafio ativo com esta pessoa para este jogo." },
        { status: 400 }
      );
    }

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("name")
      .eq("clerk_id", userId)
      .single();

    const challengerName = user?.name || "Usuário";

    const { data: challenge, error: challengeError } = await supabaseAdmin
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

    if (challengeError) {
      console.error("Error creating challenge:", challengeError);
      return NextResponse.json(
        { success: false, error: "Erro ao criar desafio." },
        { status: 500 }
      );
    }

    const challengeLeaguesData = commonLeagueIds.map((leagueId) => ({
      challenge_id: challenge.id,
      league_id: leagueId,
    }));

    const { error: leaguesError } = await supabaseAdmin
      .from("challenge_leagues")
      .insert(challengeLeaguesData);

    if (leaguesError) {
      console.error("Error creating challenge_leagues:", leaguesError);
      await supabaseAdmin.from("challenges").delete().eq("id", challenge.id);
      return NextResponse.json(
        { success: false, error: "Erro ao vincular desafio às ligas." },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      challenge: {
        ...challenge,
        leagueIds: commonLeagueIds,
      },
    });
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
