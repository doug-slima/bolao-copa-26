import { supabase } from "@/lib/supabase";
import type { DbChallenge } from "./challenges";

export interface Notification {
  id: string;
  type: "challenge_received" | "challenge_accepted" | "challenge_result" | "league_invite";
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: {
    challengeId?: string;
    leagueId?: string;
    matchId?: string;
    challengerName?: string;
  };
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("challenges")
    .select("*", { count: "exact", head: true })
    .eq("challenged_id", userId)
    .eq("status", "pending");

  if (error) {
    console.error("Error getting notification count:", error);
    return 0;
  }

  return count || 0;
}

export async function getPendingNotifications(userId: string): Promise<Notification[]> {
  const { data: challenges, error } = await supabase
    .from("challenges")
    .select(`
      id,
      match_id,
      challenger_id,
      status,
      created_at,
      users!challenges_challenger_id_fkey (
        name,
        avatar_url
      )
    `)
    .eq("challenged_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error getting pending notifications:", error);
    return [];
  }

  return (challenges || []).map((c) => {
    const user = c.users as { name: string } | { name: string }[] | null;
    const userName = Array.isArray(user) ? user[0]?.name : user?.name;
    
    return {
      id: c.id,
      type: "challenge_received" as const,
      title: "Novo Desafio!",
      message: `${userName || "Alguém"} te desafiou!`,
      read: false,
      createdAt: c.created_at,
      metadata: {
        challengeId: c.id,
        matchId: c.match_id,
        challengerName: userName,
      },
    };
  });
}

export function subscribeToNotifications(
  userId: string,
  onNotification: (notification: Notification) => void
) {
  const channelId = `notifications:${userId}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
  
  const channel = supabase
    .channel(channelId)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "challenges",
        filter: `challenged_id=eq.${userId}`,
      },
      async (payload) => {
        const challenge = payload.new as {
          id: string;
          match_id: string;
          challenger_id: string;
          status: string;
          created_at: string;
        };

        if (challenge.status === "pending") {
          const { data: challenger } = await supabase
            .from("users")
            .select("name")
            .eq("clerk_id", challenge.challenger_id)
            .single();

          onNotification({
            id: challenge.id,
            type: "challenge_received",
            title: "Novo Desafio!",
            message: `${challenger?.name || "Alguém"} te desafiou!`,
            read: false,
            createdAt: challenge.created_at,
            metadata: {
              challengeId: challenge.id,
              matchId: challenge.match_id,
              challengerName: challenger?.name,
            },
          });
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
