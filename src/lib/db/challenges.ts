"use client";

import { supabase } from "@/lib/supabase";
import type { ChallengeStatus, ChallengeWinner } from "@/types";

export interface ChallengeInput {
  matchId: string;
  challengedId: string;
  challengedName: string;
  leagueIds?: string[];
}

export interface DbChallenge {
  id: string;
  matchId: string;
  challengerId: string;
  challengerName: string;
  challengedId: string;
  challengedName: string;
  status: ChallengeStatus;
  challengerPoints: number | null;
  challengedPoints: number | null;
  winner: ChallengeWinner | null;
  createdAt: Date;
  acceptedAt: Date | null;
  completedAt: Date | null;
}

function transformChallenge(row: any): DbChallenge {
  return {
    id: row.id,
    matchId: row.match_id,
    challengerId: row.challenger_id,
    challengerName: row.challenger_name,
    challengedId: row.challenged_id,
    challengedName: row.challenged_name,
    status: row.status as ChallengeStatus,
    challengerPoints: row.challenger_points,
    challengedPoints: row.challenged_points,
    winner: row.winner as ChallengeWinner | null,
    createdAt: new Date(row.created_at),
    acceptedAt: row.accepted_at ? new Date(row.accepted_at) : null,
    completedAt: row.completed_at ? new Date(row.completed_at) : null,
  };
}

export async function createChallenge(
  input: ChallengeInput
): Promise<{ success: boolean; challenge?: DbChallenge; error?: string }> {
  try {
    const response = await fetch("/api/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchId: input.matchId,
        challengedId: input.challengedId,
        challengedName: input.challengedName,
        leagueIds: input.leagueIds,
      }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      return { success: false, error: data.error || "Erro ao criar desafio." };
    }

    return { success: true, challenge: transformChallenge(data.challenge) };
  } catch (error) {
    console.error("Error creating challenge:", error);
    return { success: false, error: "Erro de conexão. Tente novamente." };
  }
}

export async function getChallengeById(id: string): Promise<DbChallenge | null> {
  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return transformChallenge(data);
}

export async function getUserChallenges(userId: string): Promise<DbChallenge[]> {
  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .or(`challenger_id.eq.${userId},challenged_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map(transformChallenge);
}

export async function getPendingChallengesForUser(userId: string): Promise<DbChallenge[]> {
  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("challenged_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map(transformChallenge);
}

export async function acceptChallenge(
  challengeId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/challenges", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        challengeId,
        action: "accept",
      }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      return { success: false, error: data.error || "Erro ao aceitar desafio." };
    }

    return { success: true };
  } catch (error) {
    console.error("Error accepting challenge:", error);
    return { success: false, error: "Erro de conexão. Tente novamente." };
  }
}

export async function declineChallenge(
  challengeId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/challenges", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        challengeId,
        action: "decline",
      }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      return { success: false, error: data.error || "Erro ao recusar desafio." };
    }

    return { success: true };
  } catch (error) {
    console.error("Error declining challenge:", error);
    return { success: false, error: "Erro de conexão. Tente novamente." };
  }
}

export async function completeChallenge(
  challengeId: string,
  challengerPoints: number,
  challengedPoints: number
): Promise<{ success: boolean; error?: string }> {
  let winner: ChallengeWinner;
  if (challengerPoints > challengedPoints) {
    winner = "challenger";
  } else if (challengedPoints > challengerPoints) {
    winner = "challenged";
  } else {
    winner = "tie";
  }

  const { error } = await supabase
    .from("challenges")
    .update({
      status: "completed",
      challenger_points: challengerPoints,
      challenged_points: challengedPoints,
      winner,
      completed_at: new Date().toISOString(),
    })
    .eq("id", challengeId);

  if (error) {
    console.error("Error completing challenge:", error);
    return { success: false, error: "Erro ao finalizar desafio." };
  }

  return { success: true };
}

export function subscribeToChallenges(
  userId: string,
  callback: (challenges: DbChallenge[]) => void
) {
  const channel = supabase
    .channel(`challenges:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "challenges",
      },
      async (payload) => {
        const row = payload.new as any;
        if (row?.challenger_id === userId || row?.challenged_id === userId) {
          const challenges = await getUserChallenges(userId);
          callback(challenges);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Stats Functions
export async function getMatchChallengeCount(
  matchId: string,
  leagueId?: string
): Promise<number> {
  if (leagueId) {
    const { data: challengeLeagues, error: clError } = await supabase
      .from("challenge_leagues")
      .select("challenge_id")
      .eq("league_id", leagueId);

    if (clError || !challengeLeagues || challengeLeagues.length === 0) {
      return 0;
    }

    const challengeIds = challengeLeagues.map((cl) => cl.challenge_id);

    const { count, error } = await supabase
      .from("challenges")
      .select("*", { count: "exact", head: true })
      .eq("match_id", matchId)
      .in("id", challengeIds)
      .in("status", ["pending", "accepted", "completed"]);

    if (error) {
      console.error("Error getting challenge count for league:", error);
      return 0;
    }

    return count || 0;
  }

  const { count, error } = await supabase
    .from("challenges")
    .select("*", { count: "exact", head: true })
    .eq("match_id", matchId)
    .in("status", ["pending", "accepted", "completed"]);

  if (error) {
    console.error("Error getting challenge count:", error);
    return 0;
  }

  return count || 0;
}

export async function getChallengeLeagues(challengeId: string): Promise<Array<{ id: string; name: string }>> {
  const { data, error } = await supabase
    .from("challenge_leagues")
    .select("league_id, leagues(id, name)")
    .eq("challenge_id", challengeId);

  if (error || !data) {
    return [];
  }

  return data
    .filter((d) => d.leagues)
    .map((d) => ({
      id: (d.leagues as any).id,
      name: (d.leagues as any).name,
    }));
}

export async function getLeagueChallengeStats(
  leagueId: string,
  userId: string
): Promise<{ wins: number; losses: number; ties: number }> {
  const { data: challengeLeagues, error: clError } = await supabase
    .from("challenge_leagues")
    .select("challenge_id")
    .eq("league_id", leagueId);

  if (clError || !challengeLeagues || challengeLeagues.length === 0) {
    return { wins: 0, losses: 0, ties: 0 };
  }

  const challengeIds = challengeLeagues.map((cl) => cl.challenge_id);

  const { data: challenges, error } = await supabase
    .from("challenges")
    .select("*")
    .in("id", challengeIds)
    .eq("status", "completed")
    .or(`challenger_id.eq.${userId},challenged_id.eq.${userId}`);

  if (error || !challenges) {
    return { wins: 0, losses: 0, ties: 0 };
  }

  let wins = 0;
  let losses = 0;
  let ties = 0;

  for (const challenge of challenges) {
    if (challenge.winner === "tie") {
      ties++;
    } else if (
      (challenge.challenger_id === userId && challenge.winner === "challenger") ||
      (challenge.challenged_id === userId && challenge.winner === "challenged")
    ) {
      wins++;
    } else {
      losses++;
    }
  }

  return { wins, losses, ties };
}
