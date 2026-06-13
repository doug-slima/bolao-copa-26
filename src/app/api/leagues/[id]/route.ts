import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function DELETE(
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

    const { id } = await params;

    const { data: league, error: fetchError } = await supabaseAdmin
      .from("leagues")
      .select("id, created_by")
      .eq("id", id)
      .single();

    if (fetchError || !league) {
      return NextResponse.json(
        { success: false, error: "Liga não encontrada" },
        { status: 404 }
      );
    }

    if (league.created_by !== userId) {
      return NextResponse.json(
        { success: false, error: "Apenas o criador pode deletar a liga" },
        { status: 403 }
      );
    }

    const { error: membersError } = await supabaseAdmin
      .from("league_members")
      .delete()
      .eq("league_id", id);

    if (membersError) {
      console.error("Error deleting league members:", membersError);
      return NextResponse.json(
        { success: false, error: "Erro ao remover membros da liga" },
        { status: 500 }
      );
    }

    const { error: leagueError } = await supabaseAdmin
      .from("leagues")
      .delete()
      .eq("id", id);

    if (leagueError) {
      console.error("Error deleting league:", leagueError);
      return NextResponse.json(
        { success: false, error: "Erro ao deletar liga" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete league API error:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
