import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { id: leagueId } = await params;

    const { data: league, error: fetchError } = await supabaseAdmin
      .from("leagues")
      .select("id, created_by")
      .eq("id", leagueId)
      .single();

    if (fetchError || !league) {
      return NextResponse.json(
        { success: false, error: "Liga não encontrada" },
        { status: 404 }
      );
    }

    if (league.created_by === userId) {
      return NextResponse.json(
        { success: false, error: "O criador da liga não pode sair. Exclua a liga ao invés disso." },
        { status: 400 }
      );
    }

    const { error: leaveError } = await supabaseAdmin
      .from("league_members")
      .delete()
      .eq("league_id", leagueId)
      .eq("user_id", userId);

    if (leaveError) {
      console.error("Error leaving league:", leaveError);
      return NextResponse.json(
        { success: false, error: "Erro ao sair da liga" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Leave league API error:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
