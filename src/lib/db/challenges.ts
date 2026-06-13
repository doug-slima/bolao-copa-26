"use client";

import { supabase } from "@/lib/supabase";
import type { ChallengeStatus, ChallengeWinner } from "@/types";

export interface ChallengeInput {
  matchId: string;
  challengerId: string;
  challengerName: string;
  challengedId: string;
  challengedName: string;
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
  const { data: existing } = await supabase
    .from("challenges")
    .select("id")
    .eq("match_id", input.matchId)
    .eq("challenger_id", input.challengerId)
    .eq("challenged_id", input.challengedId)
    .single();

  if (existing) {
    return { success: false, error: "Você já desafiou este amigo neste jogo." };
  }

  const { data, error } = await supabase
    .from("challenges")
    .insert({
      match_id: input.matchId,
      challenger_id: input.challengerId,
      challenger_name: input.challengerName,
      challenged_id: input.challengedId,
      challenged_name: input.challengedName,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating challenge:", error);
    return { success: false, error: "Erro ao criar desafio." };
  }

  return { success: true, challenge: transformChallenge(data) };
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
  const { error } = await supabase
    .from("challenges")
    .update({
      status: "accepted",
      accepted_at: new Date().toISOString(),
    })
    .eq("id", challengeId);

  if (error) {
    console.error("Error accepting challenge:", error);
    return { success: false, error: "Erro ao aceitar desafio." };
  }

  return { success: true };
}

export async function declineChallenge(
  challengeId: string
): Promise<{ success: boolean; error?: string }> {
  const { error } = await supabase
    .from("challenges")
    .update({
      status: "declined",
    })
    .eq("id", challengeId);

  if (error) {
    console.error("Error declining challenge:", error);
    return { success: false, error: "Erro ao recusar desafio." };
  }

  return { success: true };
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
