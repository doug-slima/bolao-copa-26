"use client";

import { supabase } from "@/lib/supabase";
import type { UserRankingExtended, RankingMovement } from "@/types";

export interface DbUser {
  id: string;
  clerkId: string;
  name: string;
  avatarUrl: string | null;
  totalPoints: number;
  exactPredictions: number;
  correctResults: number;
  correctFirstScorers: number;
  totalPredictions: number;
  challengeWins: number;
  challengeLosses: number;
  currentStreak: number;
  bestStreak: number;
  createdAt: Date;
  updatedAt: Date | null;
}

function transformUser(row: any): DbUser {
  return {
    id: row.id,
    clerkId: row.clerk_id,
    name: row.name,
    avatarUrl: row.avatar_url,
    totalPoints: row.total_points,
    exactPredictions: row.exact_predictions,
    correctResults: row.correct_results,
    correctFirstScorers: row.correct_first_scorers,
    totalPredictions: row.total_predictions,
    challengeWins: row.challenge_wins,
    challengeLosses: row.challenge_losses,
    currentStreak: row.current_streak,
    bestStreak: row.best_streak,
    createdAt: new Date(row.created_at),
    updatedAt: row.updated_at ? new Date(row.updated_at) : null,
  };
}

export async function getOrCreateUser(
  clerkId: string,
  name: string,
  avatarUrl?: string
): Promise<DbUser | null> {
  const { data: existing } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", clerkId)
    .single();

  if (existing) {
    if (existing.name !== name || existing.avatar_url !== avatarUrl) {
      const { data: updated } = await supabase
        .from("users")
        .update({
          name,
          avatar_url: avatarUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq("clerk_id", clerkId)
        .select()
        .single();

      return updated ? transformUser(updated) : transformUser(existing);
    }
    return transformUser(existing);
  }

  const { data: created, error } = await supabase
    .from("users")
    .insert({
      clerk_id: clerkId,
      name,
      avatar_url: avatarUrl || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating user:", error);
    return null;
  }

  return transformUser(created);
}

export async function getUserByClerkId(clerkId: string): Promise<DbUser | null> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("clerk_id", clerkId)
    .single();

  if (error || !data) {
    return null;
  }

  return transformUser(data);
}

export async function getGeneralRanking(): Promise<UserRankingExtended[]> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("total_points", { ascending: false })
    .limit(100);

  if (error || !data) {
    return [];
  }

  return data.map((row, index) => ({
    userId: row.clerk_id,
    userName: row.name,
    avatarUrl: row.avatar_url || undefined,
    totalPoints: row.total_points,
    exactPredictions: row.exact_predictions,
    correctResults: row.correct_results,
    correctFirstScorers: row.correct_first_scorers,
    totalPredictions: row.total_predictions,
    position: index + 1,
    movement: "same" as RankingMovement,
    positionChange: 0,
    challengeWins: row.challenge_wins,
    challengeLosses: row.challenge_losses,
    currentStreak: row.current_streak,
    uniqueExactPredictions: 0,
    closeCallMisses: 0,
  }));
}

export async function getLeagueRanking(leagueId: string): Promise<UserRankingExtended[]> {
  const { data: members, error: memberError } = await supabase
    .from("league_members")
    .select("user_id")
    .eq("league_id", leagueId);

  if (memberError || !members || members.length === 0) {
    return [];
  }

  const userIds = members.map((m) => m.user_id);

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .in("clerk_id", userIds)
    .order("total_points", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data.map((row, index) => ({
    userId: row.clerk_id,
    userName: row.name,
    avatarUrl: row.avatar_url || undefined,
    totalPoints: row.total_points,
    exactPredictions: row.exact_predictions,
    correctResults: row.correct_results,
    correctFirstScorers: row.correct_first_scorers,
    totalPredictions: row.total_predictions,
    position: index + 1,
    movement: "same" as RankingMovement,
    positionChange: 0,
    challengeWins: row.challenge_wins,
    challengeLosses: row.challenge_losses,
    currentStreak: row.current_streak,
    uniqueExactPredictions: 0,
    closeCallMisses: 0,
  }));
}

export async function updateUserStats(
  clerkId: string,
  stats: Partial<{
    totalPoints: number;
    exactPredictions: number;
    correctResults: number;
    correctFirstScorers: number;
    totalPredictions: number;
    challengeWins: number;
    challengeLosses: number;
    currentStreak: number;
    bestStreak: number;
  }>
): Promise<{ success: boolean; error?: string }> {
  const updateData: any = { updated_at: new Date().toISOString() };

  if (stats.totalPoints !== undefined) updateData.total_points = stats.totalPoints;
  if (stats.exactPredictions !== undefined) updateData.exact_predictions = stats.exactPredictions;
  if (stats.correctResults !== undefined) updateData.correct_results = stats.correctResults;
  if (stats.correctFirstScorers !== undefined) updateData.correct_first_scorers = stats.correctFirstScorers;
  if (stats.totalPredictions !== undefined) updateData.total_predictions = stats.totalPredictions;
  if (stats.challengeWins !== undefined) updateData.challenge_wins = stats.challengeWins;
  if (stats.challengeLosses !== undefined) updateData.challenge_losses = stats.challengeLosses;
  if (stats.currentStreak !== undefined) updateData.current_streak = stats.currentStreak;
  if (stats.bestStreak !== undefined) updateData.best_streak = stats.bestStreak;

  const { error } = await supabase
    .from("users")
    .update(updateData)
    .eq("clerk_id", clerkId);

  if (error) {
    console.error("Error updating user stats:", error);
    return { success: false, error: "Erro ao atualizar estatísticas." };
  }

  return { success: true };
}

export function subscribeToRanking(callback: (rankings: UserRankingExtended[]) => void) {
  const channel = supabase
    .channel("ranking")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "users",
      },
      async () => {
        const rankings = await getGeneralRanking();
        callback(rankings);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
