"use client";

import { supabase } from "@/lib/supabase";

export interface LeagueInput {
  name: string;
  description?: string;
}

export interface DbLeague {
  id: string;
  name: string;
  description: string | null;
  inviteCode: string;
  createdBy: string;
  createdByName: string;
  memberCount: number;
  createdAt: Date;
}

export interface DbLeagueMember {
  id: string;
  leagueId: string;
  userId: string;
  userName: string;
  userAvatarUrl: string | null;
  joinedAt: Date;
}

function transformLeague(row: any, memberCount: number = 0): DbLeague {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    inviteCode: row.invite_code,
    createdBy: row.created_by,
    createdByName: row.created_by_name,
    memberCount,
    createdAt: new Date(row.created_at),
  };
}

function transformMember(row: any): DbLeagueMember {
  return {
    id: row.id,
    leagueId: row.league_id,
    userId: row.user_id,
    userName: row.user_name,
    userAvatarUrl: row.user_avatar_url,
    joinedAt: new Date(row.joined_at),
  };
}

export async function createLeague(
  input: LeagueInput
): Promise<{ success: boolean; league?: DbLeague; error?: string }> {
  try {
    const response = await fetch("/api/leagues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: input.name,
        description: input.description,
      }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      return { success: false, error: data.error || "Erro ao criar liga." };
    }

    return { success: true, league: transformLeague(data.league, 1) };
  } catch (error) {
    console.error("Error creating league:", error);
    return { success: false, error: "Erro de conexão. Tente novamente." };
  }
}

export async function getLeagueById(id: string): Promise<DbLeague | null> {
  const { data: league, error } = await supabase
    .from("leagues")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !league) {
    return null;
  }

  const { count } = await supabase
    .from("league_members")
    .select("*", { count: "exact", head: true })
    .eq("league_id", id);

  return transformLeague(league, count || 0);
}

export async function getLeagueByInviteCode(code: string): Promise<DbLeague | null> {
  const { data: league, error } = await supabase
    .from("leagues")
    .select("*")
    .eq("invite_code", code.toUpperCase())
    .single();

  if (error || !league) {
    return null;
  }

  const { count } = await supabase
    .from("league_members")
    .select("*", { count: "exact", head: true })
    .eq("league_id", league.id);

  return transformLeague(league, count || 0);
}

export async function getUserLeagues(userId: string): Promise<DbLeague[]> {
  const { data: memberships, error: memberError } = await supabase
    .from("league_members")
    .select("league_id")
    .eq("user_id", userId);

  if (memberError || !memberships || memberships.length === 0) {
    return [];
  }

  const leagueIds = memberships.map((m) => m.league_id);

  const { data: leagues, error: leagueError } = await supabase
    .from("leagues")
    .select("*")
    .in("id", leagueIds)
    .order("created_at", { ascending: false });

  if (leagueError || !leagues) {
    return [];
  }

  const leaguesWithCount = await Promise.all(
    leagues.map(async (league) => {
      const { count } = await supabase
        .from("league_members")
        .select("*", { count: "exact", head: true })
        .eq("league_id", league.id);
      return transformLeague(league, count || 0);
    })
  );

  return leaguesWithCount;
}

export async function joinLeague(
  inviteCode: string
): Promise<{ success: boolean; league?: DbLeague; error?: string }> {
  try {
    const response = await fetch("/api/leagues/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteCode }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      return { success: false, error: data.error || "Erro ao entrar na liga." };
    }

    return { success: true, league: transformLeague(data.league) };
  } catch (error) {
    console.error("Error joining league:", error);
    return { success: false, error: "Erro de conexão. Tente novamente." };
  }
}

export async function leaveLeague(
  leagueId: string,
  _userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/leagues/${leagueId}/leave`, {
      method: "POST",
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      return { success: false, error: data.error || "Erro ao sair da liga." };
    }

    return { success: true };
  } catch (error) {
    console.error("Error leaving league:", error);
    return { success: false, error: "Erro de conexão. Tente novamente." };
  }
}

export async function deleteLeague(
  leagueId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`/api/leagues/${leagueId}`, {
      method: "DELETE",
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      return { success: false, error: data.error || "Erro ao deletar liga." };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting league:", error);
    return { success: false, error: "Erro de conexão. Tente novamente." };
  }
}

export async function getLeagueMembers(leagueId: string): Promise<DbLeagueMember[]> {
  const { data, error } = await supabase
    .from("league_members")
    .select("*")
    .eq("league_id", leagueId)
    .order("joined_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map(transformMember);
}

export function subscribeToLeague(
  leagueId: string,
  callback: (members: DbLeagueMember[]) => void
) {
  const channel = supabase
    .channel(`league:${leagueId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "league_members",
        filter: `league_id=eq.${leagueId}`,
      },
      async () => {
        const members = await getLeagueMembers(leagueId);
        callback(members);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
