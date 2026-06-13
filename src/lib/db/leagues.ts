"use client";

import { supabase } from "@/lib/supabase";

export interface LeagueInput {
  name: string;
  description?: string;
  createdBy: string;
  createdByName: string;
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

function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
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
  const inviteCode = generateInviteCode();

  const { data: league, error: leagueError } = await supabase
    .from("leagues")
    .insert({
      name: input.name,
      description: input.description || null,
      invite_code: inviteCode,
      created_by: input.createdBy,
      created_by_name: input.createdByName,
    })
    .select()
    .single();

  if (leagueError) {
    console.error("Error creating league:", leagueError);
    return { success: false, error: "Erro ao criar liga." };
  }

  const { error: memberError } = await supabase
    .from("league_members")
    .insert({
      league_id: league.id,
      user_id: input.createdBy,
      user_name: input.createdByName,
    });

  if (memberError) {
    console.error("Error adding creator as member:", memberError);
  }

  return { success: true, league: transformLeague(league, 1) };
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
  inviteCode: string,
  userId: string,
  userName: string,
  userAvatarUrl?: string
): Promise<{ success: boolean; league?: DbLeague; error?: string }> {
  const league = await getLeagueByInviteCode(inviteCode);

  if (!league) {
    return { success: false, error: "Código de convite inválido." };
  }

  const { data: existing } = await supabase
    .from("league_members")
    .select("id")
    .eq("league_id", league.id)
    .eq("user_id", userId)
    .single();

  if (existing) {
    return { success: false, error: "Você já faz parte desta liga." };
  }

  const { error } = await supabase
    .from("league_members")
    .insert({
      league_id: league.id,
      user_id: userId,
      user_name: userName,
      user_avatar_url: userAvatarUrl || null,
    });

  if (error) {
    console.error("Error joining league:", error);
    return { success: false, error: "Erro ao entrar na liga." };
  }

  const updatedLeague = await getLeagueById(league.id);
  return { success: true, league: updatedLeague || league };
}

export async function leaveLeague(
  leagueId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("league_members")
    .delete()
    .eq("league_id", leagueId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error leaving league:", error);
    return { success: false, error: "Erro ao sair da liga." };
  }

  return { success: true };
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
