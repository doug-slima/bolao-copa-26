"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import {
  Trophy,
  SoccerBall,
  SneakerMove,
  Fire,
  Snowflake,
  Medal,
  Ranking,
  Sword,
  Eye,
  FlagBanner,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Switcher } from "@/components/bolao/switcher";
import { RankingTable } from "@/components/bolao/ranking-table";
import { MetricCard } from "@/components/bolao/metric-card";
import { MobileTabSelect } from "@/components/bolao/mobile-tab-select";
import { cn } from "@/lib/utils";
import type { UserRankingExtended, MetricLeader, Match } from "@/types";
import {
  getGeneralRanking as dbGetGeneralRanking,
  getLeagueRanking as dbGetLeagueRanking,
  subscribeToRanking,
} from "@/lib/db/users";
import {
  getUserLeagues as dbGetUserLeagues,
  type DbLeague,
} from "@/lib/db/leagues";

type TabMode = "geral" | "ligas";

interface RankingPageClientProps {
  matches: Match[];
}

export function RankingPageClient({ matches }: RankingPageClientProps) {
  const searchParams = useSearchParams();
  const { isSignedIn, userId } = useAuth();
  const [tabMode, setTabMode] = useState<TabMode>("geral");
  const [selectedLeagueId, setSelectedLeagueId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [initialLeagueFromUrl, setInitialLeagueFromUrl] = useState<string | null>(null);

  const [generalRanking, setGeneralRanking] = useState<UserRankingExtended[]>([]);
  const [userLeagues, setUserLeagues] = useState<DbLeague[]>([]);
  const [leagueRanking, setLeagueRanking] = useState<UserRankingExtended[]>([]);

  useEffect(() => {
    setMounted(true);
    loadGeneralRanking();
    
    const leagueParam = searchParams.get("liga");
    if (leagueParam) {
      setInitialLeagueFromUrl(leagueParam);
      setTabMode("ligas");
      setSelectedLeagueId(leagueParam);
    }
  }, [searchParams]);

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
    if (userLeagues.length > 0 && !selectedLeagueId && !initialLeagueFromUrl) {
      setSelectedLeagueId(userLeagues[0].id);
    }
  }, [userLeagues, selectedLeagueId, initialLeagueFromUrl]);

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
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Ranking</h1>
        
        {/* Desktop tabs */}
        <div className="hidden md:flex items-center gap-2">
          {(["geral", "ligas"] as const).map((tab) => (
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
            </button>
          ))}
        </div>

        {/* Mobile tabs */}
        <div className="md:hidden">
          <MobileTabSelect
            value={tabMode}
            onChange={(value) => setTabMode(value as TabMode)}
            options={[
              { value: "geral", label: "Geral" },
              { value: "ligas", label: "Minhas Ligas" },
            ]}
          />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <MetricCard
              title="Top Boleiros"
              description="Os reis da pontuação"
              icon={SneakerMove}
              iconColor="text-indigo-500"
              leaders={topScorers}
            />
            <MetricCard
              title="Top Artilheiros"
              description="Maiores acertos únicos"
              icon={SoccerBall}
              iconColor="text-green-500"
              leaders={topVidentes}
            />
            <MetricCard
              title="Top Desafiantes"
              description="Mestres dos duelos"
              icon={Fire}
              iconColor="text-orange-500"
              leaders={topChallengers}
            />
            <MetricCard
              title="Top Sequências"
              description="Melhores sequências de acertos"
              icon={Ranking}
              iconColor="text-yellow-500"
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
              <FlagBanner size={48} className="text-muted-foreground" />
              <p className="text-muted-foreground text-center">
                Você ainda não participa de nenhuma liga
              </p>
              <Button variant="outline" asChild>
                <a href="/ligas">Criar uma Liga</a>
              </Button>
            </div>
          ) : (
            <>
              {/* League Metric Cards */}
              {leagueMetrics && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {leagueMetrics.leader && (
                    <MetricCard
                      title="Líder"
                      description="O chefão da liga"
                      icon={FlagBanner}
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
    </div>
  );
}
