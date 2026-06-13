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

export async function syncUser(): Promise<DbUser | null> {
  try {
    const response = await fetch("/api/users", {
      method: "POST",
    });

    const data = await response.json();
    
    if (!response.ok || !data.success) {
      console.error("Error syncing user:", data.error);
      return null;
    }

    return transformUser(data.user);
  } catch (error) {
    console.error("Error syncing user:", error);
    return null;
  }
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
    .gt("total_points", 0)
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
    .gt("total_points", 0)
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
