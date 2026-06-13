"use client";

import { supabase } from "@/lib/supabase";
import type { FirstToScore } from "@/types";

export interface PredictionInput {
  matchId: string;
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
  try {
    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchId: input.matchId,
        homeScore: input.homeScore,
        awayScore: input.awayScore,
        firstToScore: input.firstToScore,
        matchDate: matchDate.toISOString(),
      }),
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      return { success: false, error: data.error || "Erro ao salvar chute." };
    }

    return { success: true, prediction: transformPrediction(data.prediction) };
  } catch (error) {
    console.error("Error saving prediction:", error);
    return { success: false, error: "Erro de conexão. Tente novamente." };
  }
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
  matchDate: Date
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `/api/predictions?matchId=${encodeURIComponent(matchId)}&matchDate=${encodeURIComponent(matchDate.toISOString())}`,
      { method: "DELETE" }
    );

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      return { success: false, error: data.error || "Erro ao remover chute." };
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting prediction:", error);
    return { success: false, error: "Erro de conexão. Tente novamente." };
  }
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

// Stats Types
export interface MatchPredictionStats {
  totalPredictions: number;
  mostPopularScore: {
    homeScore: number;
    awayScore: number;
    count: number;
  } | null;
}

export interface PredictionRankingEntry {
  userId: string;
  userName: string;
  userAvatarUrl: string | null;
  points: number;
  homeScore: number;
  awayScore: number;
}

// Stats Functions
export async function getMatchPredictionStats(
  matchId: string,
  leagueId?: string
): Promise<MatchPredictionStats> {
  let query = supabase
    .from("predictions")
    .select("home_score, away_score")
    .eq("match_id", matchId);

  // If leagueId provided, filter by league members (would need a join)
  // For now, we get all predictions for the match

  const { data, error } = await query;

  if (error || !data || data.length === 0) {
    return {
      totalPredictions: 0,
      mostPopularScore: null,
    };
  }

  // Count scores to find most popular
  const scoreCounts = new Map<string, { homeScore: number; awayScore: number; count: number }>();
  
  for (const pred of data) {
    const key = `${pred.home_score}-${pred.away_score}`;
    const existing = scoreCounts.get(key);
    if (existing) {
      existing.count++;
    } else {
      scoreCounts.set(key, {
        homeScore: pred.home_score,
        awayScore: pred.away_score,
        count: 1,
      });
    }
  }

  // Find most popular
  let mostPopular: { homeScore: number; awayScore: number; count: number } | null = null;
  for (const entry of scoreCounts.values()) {
    if (!mostPopular || entry.count > mostPopular.count) {
      mostPopular = entry;
    }
  }

  return {
    totalPredictions: data.length,
    mostPopularScore: mostPopular,
  };
}

export async function getMatchPredictionRanking(
  matchId: string,
  leagueId?: string
): Promise<PredictionRankingEntry[]> {
  const { data, error } = await supabase
    .from("predictions")
    .select("user_id, user_name, user_avatar_url, home_score, away_score, points_total")
    .eq("match_id", matchId)
    .not("points_total", "is", null)
    .order("points_total", { ascending: false })
    .limit(10);

  if (error || !data) {
    return [];
  }

  return data.map((row) => ({
    userId: row.user_id,
    userName: row.user_name,
    userAvatarUrl: row.user_avatar_url,
    points: row.points_total || 0,
    homeScore: row.home_score,
    awayScore: row.away_score,
  }));
}

export async function getLeaguePredictionCounts(
  matchIds: string[],
  leagueId: string
): Promise<Record<string, number>> {
  if (matchIds.length === 0) return {};

  const { data: members, error: memberError } = await supabase
    .from("league_members")
    .select("user_id")
    .eq("league_id", leagueId);

  if (memberError || !members || members.length === 0) {
    return {};
  }

  const memberIds = members.map((m) => m.user_id);

  const { data, error } = await supabase
    .from("predictions")
    .select("match_id, user_id")
    .in("match_id", matchIds)
    .in("user_id", memberIds);

  if (error || !data) {
    return {};
  }

  const counts: Record<string, number> = {};
  for (const pred of data) {
    counts[pred.match_id] = (counts[pred.match_id] || 0) + 1;
  }

  return counts;
}
