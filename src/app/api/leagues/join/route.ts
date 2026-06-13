import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { supabaseAdmin } from "@/lib/supabase-server";

const JoinLeagueSchema = z.object({
  inviteCode: z.string().length(6),
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
    const validation = JoinLeagueSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Código inválido", details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { inviteCode } = validation.data;

    const { data: league } = await supabaseAdmin
      .from("leagues")
      .select("*")
      .eq("invite_code", inviteCode.toUpperCase())
      .single();

    if (!league) {
      return NextResponse.json(
        { success: false, error: "Liga não encontrada. Verifique o código." },
        { status: 404 }
      );
    }

    const { data: existingMember } = await supabaseAdmin
      .from("league_members")
      .select("id")
      .eq("league_id", league.id)
      .eq("user_id", userId)
      .single();

    if (existingMember) {
      return NextResponse.json(
        { success: false, error: "Você já é membro desta liga." },
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

    const { error } = await supabaseAdmin
      .from("league_members")
      .insert({
        league_id: league.id,
        user_id: userId,
        user_name: userName,
        user_avatar_url: userAvatarUrl,
      });

    if (error) {
      console.error("Error joining league:", error);
      return NextResponse.json(
        { success: false, error: "Erro ao entrar na liga." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, league });
  } catch (error) {
    console.error("Join League API error:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
