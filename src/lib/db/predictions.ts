"use client";

import { supabase } from "@/lib/supabase";
import type { FirstToScore } from "@/types";
import { isPredictionDeadlinePassed } from "@/lib/scoring";

export interface PredictionInput {
  matchId: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  homeScore: number;
  awayScore: number;
  firstToScore: FirstToScore;
}

export interface DbPrediction {
  id: string;
  matchId: string;
  userId: string;
  userName: string;
  userAvatarUrl: string | null;
  homeScore: number;
  awayScore: number;
  firstToScore: FirstToScore;
  pointsTotal: number | null;
  createdAt: Date;
  updatedAt: Date | null;
}

function transformPrediction(row: any): DbPrediction {
  return {
    id: row.id,
    matchId: row.match_id,
    userId: row.user_id,
    userName: row.user_name,
    userAvatarUrl: row.user_avatar_url,
    homeScore: row.home_score,
    awayScore: row.away_score,
    firstToScore: row.first_to_score as FirstToScore,
    pointsTotal: row.points_total,
    createdAt: new Date(row.created_at),
    updatedAt: row.updated_at ? new Date(row.updated_at) : null,
  };
}

export async function savePrediction(
  input: PredictionInput,
  matchDate: Date
): Promise<{ success: boolean; prediction?: DbPrediction; error?: string }> {
  if (isPredictionDeadlinePassed(matchDate)) {
    return { success: false, error: "O prazo para chutes neste jogo já encerrou." };
  }

  const { data: existing } = await supabase
    .from("predictions")
    .select("id")
    .eq("match_id", input.matchId)
    .eq("user_id", input.userId)
    .single();

  if (existing) {
    const { data, error } = await supabase
      .from("predictions")
      .update({
        home_score: input.homeScore,
        away_score: input.awayScore,
        first_to_score: input.firstToScore,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating prediction:", error);
      return { success: false, error: "Erro ao atualizar chute." };
    }

    return { success: true, prediction: transformPrediction(data) };
  }

  const { data, error } = await supabase
    .from("predictions")
    .insert({
      match_id: input.matchId,
      user_id: input.userId,
      user_name: input.userName,
      user_avatar_url: input.userAvatarUrl || null,
      home_score: input.homeScore,
      away_score: input.awayScore,
      first_to_score: input.firstToScore,
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving prediction:", error);
    return { success: false, error: "Erro ao salvar chute." };
  }

  return { success: true, prediction: transformPrediction(data) };
}

export async function getPrediction(
  matchId: string,
  userId: string
): Promise<DbPrediction | null> {
  const { data, error } = await supabase
    .from("predictions")
    .select("*")
    .eq("match_id", matchId)
    .eq("user_id", userId)
    .single();

  if (error || !data) {
    return null;
  }

  return transformPrediction(data);
}

export async function getUserPredictions(userId: string): Promise<DbPrediction[]> {
  const { data, error } = await supabase
    .from("predictions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map(transformPrediction);
}

export async function getMatchPredictions(matchId: string): Promise<DbPrediction[]> {
  const { data, error } = await supabase
    .from("predictions")
    .select("*")
    .eq("match_id", matchId)
    .order("created_at", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map(transformPrediction);
}

export async function deletePrediction(
  matchId: string,
  userId: string,
  matchDate: Date
): Promise<{ success: boolean; error?: string }> {
  if (isPredictionDeadlinePassed(matchDate)) {
    return { success: false, error: "O prazo para modificar chutes já encerrou." };
  }

  const { error } = await supabase
    .from("predictions")
    .delete()
    .eq("match_id", matchId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error deleting prediction:", error);
    return { success: false, error: "Erro ao remover chute." };
  }

  return { success: true };
}

export function subscribeToPredictions(
  matchId: string,
  callback: (predictions: DbPrediction[]) => void
) {
  const channel = supabase
    .channel(`predictions:${matchId}`)
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "predictions",
        filter: `match_id=eq.${matchId}`,
      },
      async () => {
        const predictions = await getMatchPredictions(matchId);
        callback(predictions);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
