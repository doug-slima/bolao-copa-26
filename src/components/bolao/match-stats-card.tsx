"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { ChartBar, Users, Trophy, Fire, Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Match } from "@/types";
import {
  getMatchPredictionStats,
  getMatchPredictionRanking,
  type MatchPredictionStats,
  type PredictionRankingEntry,
} from "@/lib/db/predictions";
import { getMatchChallengeCount } from "@/lib/db/challenges";

interface MatchStatsCardProps {
  match: Match;
  userLeagueId?: string | null;
}

export function MatchStatsCard({ match, userLeagueId }: MatchStatsCardProps) {
  const { userId } = useAuth();
  const [stats, setStats] = useState<MatchPredictionStats | null>(null);
  const [ranking, setRanking] = useState<PredictionRankingEntry[]>([]);
  const [challengeCount, setChallengeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const isMatchFinished = match.status === "finished" || (match.score && match.score.home !== undefined);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [predictionStats, challenges] = await Promise.all([
          getMatchPredictionStats(match.id, userLeagueId || undefined),
          getMatchChallengeCount(match.id, userLeagueId || undefined),
        ]);
        
        setStats(predictionStats);
        setChallengeCount(challenges);

        if (isMatchFinished) {
          const rankingData = await getMatchPredictionRanking(match.id, userLeagueId || undefined);
          setRanking(rankingData);
        }
      } catch (error) {
        console.error("Error fetching match stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [match.id, userLeagueId, isMatchFinished]);

  if (loading) {
    return (
      <div className="bg-card rounded-2xl border border-border/50 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-pulse text-muted-foreground">Carregando estatísticas...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <ChartBar size={24} weight="duotone" className="text-primary" />
        <h3 className="font-semibold">
          {userLeagueId ? "Estatísticas da Liga" : "Estatísticas Gerais"}
        </h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
            <Users size={16} weight="bold" />
            <span className="text-xs">Chutes</span>
          </div>
          <p className="text-2xl font-bold">{stats?.totalPredictions ?? 0}</p>
        </div>
        <div className="bg-muted rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
            <Fire size={16} weight="bold" />
            <span className="text-xs">Desafios</span>
          </div>
          <p className="text-2xl font-bold">{challengeCount}</p>
        </div>
      </div>

      {/* Most Popular Score */}
      {stats?.mostPopularScore && (
        <div className="bg-muted/50 rounded-xl p-4">
          <p className="text-sm text-muted-foreground mb-2">Placar mais chutado</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-xl font-bold">{stats.mostPopularScore.homeScore}</span>
            <span className="text-muted-foreground">×</span>
            <span className="text-xl font-bold">{stats.mostPopularScore.awayScore}</span>
            <span className="text-sm text-muted-foreground ml-2">
              ({stats.mostPopularScore.count} {stats.mostPopularScore.count === 1 ? "chute" : "chutes"})
            </span>
          </div>
        </div>
      )}

      {/* Ranking (only for finished matches) */}
      {isMatchFinished && ranking.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Trophy size={18} weight="bold" className="text-yellow-500" />
            <p className="text-sm font-medium">Ranking de Acertos</p>
          </div>
          <div className="space-y-2">
            {ranking.slice(0, 5).map((entry, index) => (
              <div
                key={entry.userId}
                className="flex items-center justify-between p-3 bg-muted rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? "bg-yellow-500 text-black" :
                    index === 1 ? "bg-gray-300 text-black" :
                    index === 2 ? "bg-amber-600 text-white" :
                    "bg-muted-foreground/20 text-muted-foreground"
                  }`}>
                    {index + 1}
                  </span>
                  <span className="font-medium text-sm">{entry.userName}</span>
                </div>
                <span className="text-sm font-bold text-primary">{entry.points} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No League CTA */}
      {!userLeagueId && (
        <div className="bg-primary/5 rounded-xl p-4 space-y-3">
          <p className="text-sm text-center text-muted-foreground">
            Entre em uma liga para ver estatísticas dos seus amigos!
          </p>
          <Link href="/ligas" className="block">
            <Button variant="outline" className="w-full h-12 text-base rounded-full">
              <Plus size={18} weight="bold" className="mr-2" />
              Criar ou Entrar em Liga
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
