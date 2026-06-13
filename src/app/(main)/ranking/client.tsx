"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import {
  Trophy,
  Eye,
  Sword,
  Fire,
  Snowflake,
  Crown,
  Medal,
  TrendUp,
  Target,
  ChartLine,
  Percent,
  Lightning,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Switcher } from "@/components/bolao/switcher";
import { RankingTable } from "@/components/bolao/ranking-table";
import { MetricCard, SingleMetricCard } from "@/components/bolao/metric-card";
import { cn } from "@/lib/utils";
import type { UserRankingExtended, MetricLeader, UserMetrics } from "@/types";
import {
  getGeneralRanking as dbGetGeneralRanking,
  getLeagueRanking as dbGetLeagueRanking,
  subscribeToRanking,
} from "@/lib/db/users";
import {
  getUserLeagues as dbGetUserLeagues,
  type DbLeague,
} from "@/lib/db/leagues";

type TabMode = "geral" | "ligas" | "meu";

export function RankingPageClient() {
  const { isSignedIn, userId } = useAuth();
  const [tabMode, setTabMode] = useState<TabMode>("geral");
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);

  const [generalRanking, setGeneralRanking] = useState<UserRankingExtended[]>([]);
  const [userLeagues, setUserLeagues] = useState<DbLeague[]>([]);
  const [leagueRanking, setLeagueRanking] = useState<UserRankingExtended[]>([]);

  useEffect(() => {
    setMounted(true);
    loadGeneralRanking();
  }, []);

  useEffect(() => {
    if (userId) {
      loadUserLeagues();
    }
  }, [userId]);

  useEffect(() => {
    if (selectedLeagueId) {
      loadLeagueRanking(selectedLeagueId);
    }
  }, [selectedLeagueId]);

  useEffect(() => {
    if (userLeagues.length > 0 && !selectedLeagueId) {
      setSelectedLeagueId(userLeagues[0].id);
    }
  }, [userLeagues, selectedLeagueId]);

  useEffect(() => {
    const unsubscribe = subscribeToRanking((rankings) => {
      setGeneralRanking(rankings);
    });
    return () => unsubscribe();
  }, []);

  const loadGeneralRanking = async () => {
    setLoading(true);
    const rankings = await dbGetGeneralRanking();
    setGeneralRanking(rankings);
    setLoading(false);
  };

  const loadUserLeagues = async () => {
    if (!userId) return;
    const leagues = await dbGetUserLeagues(userId);
    setUserLeagues(leagues);
  };

  const loadLeagueRanking = async (leagueId: string) => {
    const rankings = await dbGetLeagueRanking(leagueId);
    setLeagueRanking(rankings);
  };

  const topScorers: MetricLeader[] = generalRanking.slice(0, 5).map((r) => ({
    userId: r.userId,
    userName: r.userName,
    avatarUrl: r.avatarUrl,
    value: r.totalPoints,
  }));

  const topVidentes: MetricLeader[] = [...generalRanking]
    .sort((a, b) => b.exactPredictions - a.exactPredictions)
    .slice(0, 5)
    .map((r) => ({
      userId: r.userId,
      userName: r.userName,
      avatarUrl: r.avatarUrl,
      value: r.exactPredictions,
    }));

  const topChallengers: MetricLeader[] = [...generalRanking]
    .sort((a, b) => b.challengeWins - a.challengeWins)
    .slice(0, 5)
    .map((r) => ({
      userId: r.userId,
      userName: r.userName,
      avatarUrl: r.avatarUrl,
      value: r.challengeWins,
    }));

  const hotStreaks: MetricLeader[] = [...generalRanking]
    .sort((a, b) => b.currentStreak - a.currentStreak)
    .slice(0, 5)
    .map((r) => ({
      userId: r.userId,
      userName: r.userName,
      avatarUrl: r.avatarUrl,
      value: r.currentStreak,
    }));

  const coldFeet: MetricLeader[] = [...generalRanking]
    .sort((a, b) => a.totalPoints - b.totalPoints)
    .slice(0, 5)
    .map((r) => ({
      userId: r.userId,
      userName: r.userName,
      avatarUrl: r.avatarUrl,
      value: r.totalPoints,
    }));

  const userMetrics: UserMetrics | null = userId
    ? (() => {
        const userRank = generalRanking.find((r) => r.userId === userId);
        if (!userRank) return null;
        return {
          userId: userRank.userId,
          userName: userRank.userName,
          avatarUrl: userRank.avatarUrl,
          position: userRank.position,
          previousPosition: userRank.position,
          totalPoints: userRank.totalPoints,
          pointsThisWeek: 0,
          exactPredictions: userRank.exactPredictions,
          uniqueExactPredictions: userRank.uniqueExactPredictions,
          correctResults: userRank.correctResults,
          correctFirstScorers: userRank.correctFirstScorers,
          totalPredictions: userRank.totalPredictions,
          challengeWins: userRank.challengeWins,
          challengeLosses: userRank.challengeLosses,
          currentStreak: userRank.currentStreak,
          bestStreak: userRank.currentStreak,
          closeCallMisses: userRank.closeCallMisses,
          pointsBreakdown: {
            fromExactScores: 0,
            fromResults: 0,
            fromFirstScorer: 0,
            fromChallenges: 0,
          },
          positionHistory: [],
        };
      })()
    : null;

  const averageStats = {
    avgPoints: generalRanking.length > 0 
      ? Math.round(generalRanking.reduce((a, b) => a + b.totalPoints, 0) / generalRanking.length)
      : 0,
    avgExacts: generalRanking.length > 0
      ? Math.round(generalRanking.reduce((a, b) => a + b.exactPredictions, 0) / generalRanking.length)
      : 0,
    avgChallengeWins: generalRanking.length > 0
      ? Math.round(generalRanking.reduce((a, b) => a + b.challengeWins, 0) / generalRanking.length)
      : 0,
  };

  const leagueMetrics = selectedLeagueId && leagueRanking.length > 0 ? (() => {
    const sortedByExacts = [...leagueRanking].sort((a, b) => b.exactPredictions - a.exactPredictions);
    const sortedByChallenges = [...leagueRanking].sort((a, b) => b.challengeWins - a.challengeWins);
    const videnteRank = sortedByExacts[0];
    const challengerRank = sortedByChallenges[0];
    
    return {
      leader: leagueRanking[0] ? { userId: leagueRanking[0].userId, userName: leagueRanking[0].userName, avatarUrl: leagueRanking[0].avatarUrl, value: leagueRanking[0].totalPoints } : null,
      vice: leagueRanking[1] ? { userId: leagueRanking[1].userId, userName: leagueRanking[1].userName, avatarUrl: leagueRanking[1].avatarUrl, value: leagueRanking[1].totalPoints } : null,
      vidente: videnteRank ? { userId: videnteRank.userId, userName: videnteRank.userName, avatarUrl: videnteRank.avatarUrl, value: videnteRank.exactPredictions } : null,
      challenger: challengerRank ? { userId: challengerRank.userId, userName: challengerRank.userName, avatarUrl: challengerRank.avatarUrl, value: challengerRank.challengeWins } : null,
      lanterna: leagueRanking[leagueRanking.length - 1] ? { userId: leagueRanking[leagueRanking.length - 1].userId, userName: leagueRanking[leagueRanking.length - 1].userName, avatarUrl: leagueRanking[leagueRanking.length - 1].avatarUrl, value: leagueRanking[leagueRanking.length - 1].totalPoints } : null,
    };
  })() : null;

  if (!mounted) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Ranking</h1>
        </div>
        <div className="h-96 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Ranking</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Trophy size={48} className="text-muted-foreground" />
          <p className="text-muted-foreground text-center">
            Faça login para ver o ranking completo
          </p>
          <SignInButton mode="modal">
            <Button>Entrar</Button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ranking</h1>
        <div className="flex items-center gap-2">
          {(["geral", "ligas", "meu"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setTabMode(tab)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                tabMode === tab
                  ? "bg-foreground text-background"
                  : "border border-white/40 text-muted-foreground hover:text-foreground hover:border-white/70"
              )}
            >
              {tab === "geral" && "Geral"}
              {tab === "ligas" && "Minhas Ligas"}
              {tab === "meu" && "Minha Performance"}
            </button>
          ))}
        </div>
      </div>

      {/* Tab: Geral */}
      {tabMode === "geral" && (
        <div className="space-y-8">
          {/* Subtitle */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground text-center">
              Classificação geral de todos os boleiros
            </p>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <MetricCard
              title="Artilheiros"
              description="Os reis da pontuação"
              icon={Trophy}
              iconColor="text-yellow-500"
              leaders={topScorers}
            />
            <MetricCard
              title="Videntes"
              description="Maiores acertos únicos"
              icon={Eye}
              iconColor="text-purple-500"
              leaders={topVidentes}
            />
            <MetricCard
              title="Desafiantes"
              description="Mestres dos duelos"
              icon={Sword}
              iconColor="text-blue-500"
              leaders={topChallengers}
            />
            <MetricCard
              title="Em Chamas"
              description="Melhores sequências de acertos"
              icon={Fire}
              iconColor="text-orange-500"
              leaders={hotStreaks}
              emptyMessage="Ninguém em sequência"
            />
            <MetricCard
              title="Pés Frios"
              description="Lanterninhas da competição"
              icon={Snowflake}
              iconColor="text-cyan-500"
              leaders={coldFeet}
            />
          </div>

          {/* Ranking Table */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Classificação Geral</h2>
            <RankingTable rankings={generalRanking} currentUserId={userId ?? undefined} />
          </div>
        </div>
      )}

      {/* Tab: Ligas */}
      {tabMode === "ligas" && (
        <div className="space-y-8">
          {/* Subtitle */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground text-center">
              Classificação das ligas que você participa
            </p>
            {userLeagues.length > 1 && (
              <Switcher
                options={userLeagues.map((l) => ({ value: l.id, label: l.name }))}
                value={selectedLeagueId || ""}
                onChange={setSelectedLeagueId}
              />
            )}
          </div>

          {userLeagues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Crown size={48} className="text-muted-foreground" />
              <p className="text-muted-foreground text-center">
                Você ainda não participa de nenhuma liga
              </p>
              <Button variant="outline">Criar uma Liga</Button>
            </div>
          ) : (
            <>
              {/* League Metric Cards */}
              {leagueMetrics && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {leagueMetrics.leader && (
                    <MetricCard
                      title="Líder"
                      description="O chefão da liga"
                      icon={Crown}
                      iconColor="text-yellow-500"
                      leaders={[leagueMetrics.leader]}
                    />
                  )}
                  {leagueMetrics.vice && (
                    <MetricCard
                      title="Vice"
                      description="No encalço do líder"
                      icon={Medal}
                      iconColor="text-zinc-400"
                      leaders={[leagueMetrics.vice]}
                    />
                  )}
                  {leagueMetrics.vidente && (
                    <MetricCard
                      title="Vidente"
                      description="Bola de cristal afiada"
                      icon={Eye}
                      iconColor="text-purple-500"
                      leaders={[leagueMetrics.vidente]}
                    />
                  )}
                  {leagueMetrics.challenger && (
                    <MetricCard
                      title="Desafiante"
                      description="Rei dos duelos"
                      icon={Sword}
                      iconColor="text-blue-500"
                      leaders={[leagueMetrics.challenger]}
                    />
                  )}
                  {leagueMetrics.lanterna && (
                    <MetricCard
                      title="Lanterna"
                      description="Alguém tem que ser"
                      icon={Snowflake}
                      iconColor="text-red-500"
                      leaders={[leagueMetrics.lanterna]}
                    />
                  )}
                </div>
              )}

              {/* League Ranking Table */}
              {leagueRanking.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4">
                    {userLeagues.find((l) => l.id === selectedLeagueId)?.name || "Liga"}
                  </h2>
                  <RankingTable
                    rankings={leagueRanking}
                    currentUserId={userId ?? undefined}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Tab: Meu Desempenho */}
      {tabMode === "meu" && (
        <div className="space-y-8">
          {/* Subtitle */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground text-center">
              Suas estatísticas e evolução no bolão
            </p>
          </div>

          {userMetrics ? (
            <>
              {/* Position & Points Cards */}
              <div className="grid grid-cols-2 gap-4">
                <SingleMetricCard
                  title="Sua Posição"
                  value={`#${userMetrics.position}`}
                  icon={TrendUp}
                  iconColor="text-primary"
                  trend={
                    userMetrics.position < userMetrics.previousPosition
                      ? "up"
                      : userMetrics.position > userMetrics.previousPosition
                        ? "down"
                        : "same"
                  }
                  trendValue={
                    userMetrics.position !== userMetrics.previousPosition
                      ? `${Math.abs(userMetrics.position - userMetrics.previousPosition)}`
                      : ""
                  }
                />
                <SingleMetricCard
                  title="Seus Pontos"
                  value={userMetrics.totalPoints}
                  subtitle={`+${userMetrics.pointsThisWeek} esta semana`}
                  icon={Trophy}
                  iconColor="text-yellow-500"
                />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4">
                <SingleMetricCard
                  title="Acertos Exatos"
                  value={userMetrics.exactPredictions}
                  subtitle={`${userMetrics.uniqueExactPredictions} únicos`}
                  icon={Target}
                  iconColor="text-green-500"
                />
                <SingleMetricCard
                  title="Desafios"
                  value={`${userMetrics.challengeWins}W`}
                  subtitle={`${userMetrics.challengeLosses} derrotas`}
                  icon={Sword}
                  iconColor="text-blue-500"
                />
                <SingleMetricCard
                  title="Sequência"
                  value={userMetrics.currentStreak}
                  subtitle={`Melhor: ${userMetrics.bestStreak}`}
                  icon={Lightning}
                  iconColor="text-orange-500"
                />
              </div>

              {/* Points Breakdown */}
              <div className="bg-card border border-border/50 rounded-2xl p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <ChartLine size={20} className="text-primary" />
                  De onde vieram seus pontos
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Placares Exatos</span>
                    <span className="font-medium">{userMetrics.pointsBreakdown.fromExactScores} pts</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Resultados Corretos</span>
                    <span className="font-medium">{userMetrics.pointsBreakdown.fromResults} pts</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Primeiro a Marcar</span>
                    <span className="font-medium">{userMetrics.pointsBreakdown.fromFirstScorer} pts</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Desafios</span>
                    <span className="font-medium">{userMetrics.pointsBreakdown.fromChallenges} pts</span>
                  </div>
                </div>
              </div>

              {/* Comparison with Average */}
              <div className="bg-card border border-border/50 rounded-2xl p-5">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Percent size={20} className="text-primary" />
                  Você vs Média Geral
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Pontuação</span>
                      <span className="text-sm">
                        <span className="font-medium">{userMetrics.totalPoints}</span>
                        <span className="text-muted-foreground"> vs </span>
                        <span className="text-muted-foreground">{averageStats.avgPoints}</span>
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${Math.min(100, (userMetrics.totalPoints / (averageStats.avgPoints * 2)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Acertos Exatos</span>
                      <span className="text-sm">
                        <span className="font-medium">{userMetrics.exactPredictions}</span>
                        <span className="text-muted-foreground"> vs </span>
                        <span className="text-muted-foreground">{averageStats.avgExacts}</span>
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500 rounded-full"
                        style={{
                          width: `${Math.min(100, (userMetrics.exactPredictions / (averageStats.avgExacts * 2)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Vitórias em Desafios</span>
                      <span className="text-sm">
                        <span className="font-medium">{userMetrics.challengeWins}</span>
                        <span className="text-muted-foreground"> vs </span>
                        <span className="text-muted-foreground">{averageStats.avgChallengeWins}</span>
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${Math.min(100, (userMetrics.challengeWins / (averageStats.avgChallengeWins * 2)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <ChartLine size={48} className="text-muted-foreground" />
              <p className="text-muted-foreground text-center">
                Faça alguns chutes para ver suas estatísticas
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
