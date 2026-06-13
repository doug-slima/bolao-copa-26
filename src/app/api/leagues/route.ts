import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-server";

const CreateLeagueSchema = z.object({
  name: z.string().min(3).max(50),
  description: z.string().max(200).optional(),
});

function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
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
    const validation = CreateLeagueSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Dados inválidos", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { name, description } = validation.data;

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("name, avatar_url")
      .eq("clerk_id", userId)
      .single();

    const userName = user?.name || "Usuário";
    const userAvatarUrl = user?.avatar_url || null;

    let inviteCode = generateInviteCode();
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const { data: existing } = await supabaseAdmin
        .from("leagues")
        .select("id")
        .eq("invite_code", inviteCode)
        .single();

      if (!existing) break;
      
      inviteCode = generateInviteCode();
      attempts++;
    }

    if (attempts >= maxAttempts) {
      return NextResponse.json(
        { success: false, error: "Erro ao gerar código. Tente novamente." },
        { status: 500 }
      );
    }

    const { data: league, error: leagueError } = await supabaseAdmin
      .from("leagues")
      .insert({
        name,
        description: description || null,
        invite_code: inviteCode,
        created_by: userId,
        created_by_name: userName,
      })
      .select()
      .single();

    if (leagueError) {
      console.error("Error creating league:", leagueError);
      return NextResponse.json(
        { success: false, error: "Erro ao criar liga." },
        { status: 500 }
      );
    }

    const { error: memberError } = await supabaseAdmin
      .from("league_members")
      .insert({
        league_id: league.id,
        user_id: userId,
        user_name: userName,
        user_avatar_url: userAvatarUrl,
      });

    if (memberError) {
      console.error("Error adding creator as member:", memberError);
    }

    return NextResponse.json({ success: true, league });
  } catch (error) {
    console.error("League API error:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
