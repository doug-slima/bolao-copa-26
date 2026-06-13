import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Não autorizado" },
        { status: 401 }
      );
    }

    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    const name = user.fullName || user.firstName || user.emailAddresses[0]?.emailAddress || "Usuário";
    const avatarUrl = user.imageUrl || null;

    const { data: existingUser } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("clerk_id", userId)
      .single();

    if (existingUser) {
      const { data, error } = await supabaseAdmin
        .from("users")
        .update({
          name,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("clerk_id", userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating user:", error);
        return NextResponse.json(
          { success: false, error: "Erro ao atualizar usuário." },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, user: data, isNew: false });
    }

    const { data, error } = await supabaseAdmin
      .from("users")
      .insert({
        clerk_id: userId,
        name,
        avatar_url: avatarUrl,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating user:", error);
      return NextResponse.json(
        { success: false, error: "Erro ao criar usuário." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, user: data, isNew: true });
  } catch (error) {
    console.error("User API error:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Não autorizado" },
        { status: 401 }
      );
    }

    const { data: user } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("clerk_id", userId)
      .single();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("User GET API error:", error);
    return NextResponse.json(
      { success: false, error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
