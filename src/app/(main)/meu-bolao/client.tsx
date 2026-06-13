"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import {
  Trophy,
  SneakerMove,
  Fire,
  TrendUp,
  Target,
  ChartLine,
  Percent,
  Lightning,
  Sword,
  FlagBanner,
  CheckCircle,
  XCircle,
  Handshake,
  User,
  UserPlus,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { SingleMetricCard } from "@/components/bolao/metric-card";
import { MatchCardWithPrediction } from "@/components/bolao/match-card-with-prediction";
import { TeamFlag } from "@/components/bolao/team-flag";
import { LeagueCard } from "@/components/bolao/league-card";
import { MobileTabSelect } from "@/components/bolao/mobile-tab-select";
import { cn } from "@/lib/utils";
import type { UserRankingExtended, Match, Prediction } from "@/types";
import {
  getGeneralRanking as dbGetGeneralRanking,
} from "@/lib/db/users";
import {
  getUserLeagues as dbGetUserLeagues,
  getLeagueMembers as dbGetLeagueMembers,
  deleteLeague as dbDeleteLeague,
  leaveLeague as dbLeaveLeague,
  type DbLeague,
} from "@/lib/db/leagues";
import { getUserPredictions } from "@/lib/db/predictions";
import {
  getUserChallenges,
  getPendingChallengesForUser,
  acceptChallenge,
  declineChallenge,
  type DbChallenge,
} from "@/lib/db/challenges";
import { POINTS, getMaxPossiblePoints } from "@/lib/scoring";

type TabMode = "resumo" | "chutes" | "desafios" | "ligas";

interface LeagueMemberSimple {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface MeuBolaoClientProps {
  matches: Match[];
}

export function MeuBolaoClient({ matches }: MeuBolaoClientProps) {
  const router = useRouter();
  const { isSignedIn, userId } = useAuth();
  const [tabMode, setTabMode] = useState<TabMode>("resumo");
  const [mounted, setMounted] = useState(false);

  const [generalRanking, setGeneralRanking] = useState<UserRankingExtended[]>([]);
  const [userLeagues, setUserLeagues] = useState<DbLeague[]>([]);
  const [leagueMembers, setLeagueMembers] = useState<Record<string, LeagueMemberSimple[]>>({});

  const [userPredictions, setUserPredictions] = useState<Prediction[]>([]);
  const [allUserChallenges, setAllUserChallenges] = useState<DbChallenge[]>([]);
  const [pendingChallenges, setPendingChallenges] = useState<DbChallenge[]>([]);

  useEffect(() => {
    setMounted(true);
    loadGeneralRanking();
  }, []);

  useEffect(() => {
    if (userId) {
      loadUserLeagues();
      loadUserPredictions();
      loadUserChallenges();
    }
  }, [userId]);

  const loadGeneralRanking = async () => {
    const rankings = await dbGetGeneralRanking();
    setGeneralRanking(rankings);
  };

  const loadUserLeagues = async () => {
    if (!userId) return;
    const leagues = await dbGetUserLeagues(userId);
    setUserLeagues(leagues);
    
    const membersMap: Record<string, LeagueMemberSimple[]> = {};
    for (const league of leagues) {
      const members = await dbGetLeagueMembers(league.id);
      membersMap[league.id] = members.map(m => ({
        id: m.userId,
        name: m.userName,
        avatarUrl: m.userAvatarUrl,
      }));
    }
    setLeagueMembers(membersMap);
  };

  const loadUserPredictions = async () => {
    if (!userId) return;
    const predictions = await getUserPredictions(userId);
    setUserPredictions(
      predictions.map((p) => ({
        id: p.id,
        matchId: p.matchId,
        userId: p.userId,
        homeScore: p.homeScore,
        awayScore: p.awayScore,
        firstToScore: p.firstToScore,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt || undefined,
      }))
    );
  };

  const loadUserChallenges = async () => {
    if (!userId) return;
    const challenges = await getUserChallenges(userId);
    const pending = await getPendingChallengesForUser(userId);
    setAllUserChallenges(challenges);
    setPendingChallenges(pending);
  };

  const userChallenges = useMemo(() => {
    const active = allUserChallenges.filter(
      (c) => c.status === "pending" || c.status === "accepted"
    );
    const sent = allUserChallenges.filter(
      (c) => c.challengerId === userId && (c.status === "pending" || c.status === "accepted")
    );
    const received = pendingChallenges;
    const completed = allUserChallenges.filter((c) => c.status === "completed");
    return { active, sent, received, completed };
  }, [allUserChallenges, pendingChallenges, userId]);

  const handleAcceptChallenge = async (challengeId: string) => {
    const result = await acceptChallenge(challengeId);
    if (result.success) {
      loadUserChallenges();
    }
  };

  const handleDeclineChallenge = async (challengeId: string) => {
    const result = await declineChallenge(challengeId);
    if (result.success) {
      loadUserChallenges();
    }
  };

  const handlePredictionChange = () => {
    loadUserPredictions();
  };

  const handleDeleteLeague = async (leagueId: string) => {
    const result = await dbDeleteLeague(leagueId);
    if (result.success) {
      loadUserLeagues();
    }
  };

  const handleLeaveLeague = async (leagueId: string) => {
    if (!userId) return;
    const result = await dbLeaveLeague(leagueId, userId);
    if (result.success) {
      loadUserLeagues();
    }
  };

  const getMatchById = (matchId: string): Match | undefined => {
    return matches.find((m) => m.id === matchId);
  };

  const predictionMap = useMemo(() => {
    const map = new Map<string, Prediction>();
    userPredictions.forEach((p) => map.set(p.matchId, p));
    return map;
  }, [userPredictions]);

  const predictedMatches = useMemo(() => {
    return matches.filter((m) => predictionMap.has(m.id));
  }, [matches, predictionMap]);

  const predictionStats = useMemo(() => {
    const total = matches.length;
    const done = predictedMatches.length;
    const maxPoints = done * getMaxPossiblePoints();

    const totalPoints = userPredictions.reduce(
      (acc, p) => acc + (p.points?.total || 0),
      0
    );
    const exactScoreHits = userPredictions.filter(
      (p) => p.points && p.points.exactScore > 0
    ).length;
    const resultHits = userPredictions.filter(
      (p) => p.points && p.points.result > 0
    ).length;
    const firstScorerHits = userPredictions.filter(
      (p) => p.points && p.points.firstToScore > 0
    ).length;

    return {
      total,
      done,
      maxPoints,
      totalPoints,
      exactScoreHits,
      resultHits,
      firstScorerHits,
    };
  }, [matches.length, predictedMatches, userPredictions]);

  const challengeStats = useMemo(() => {
    const wins = userChallenges.completed.filter(
      (c) =>
        (c.challengerId === userId && c.winner === "challenger") ||
        (c.challengedId === userId && c.winner === "challenged")
    ).length;
    const losses = userChallenges.completed.filter(
      (c) =>
        (c.challengerId === userId && c.winner === "challenged") ||
        (c.challengedId === userId && c.winner === "challenger")
    ).length;
    const ties = userChallenges.completed.filter(
      (c) => c.winner === "tie"
    ).length;
    const voided = userChallenges.completed.filter(c => c.winner === "void").length;
    const pointsFromChallenges = wins * 3 + ties * 1 + voided * -1;

    return { wins, losses, ties, pointsFromChallenges };
  }, [userChallenges.completed, userId]);

  const userMetrics = useMemo(() => {
    if (!userId) return null;
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
    };
  }, [generalRanking, userId]);

  const averageStats = useMemo(() => ({
    avgPoints: generalRanking.length > 0 
      ? Math.round(generalRanking.reduce((a, b) => a + b.totalPoints, 0) / generalRanking.length)
      : 0,
    avgExacts: generalRanking.length > 0
      ? Math.round(generalRanking.reduce((a, b) => a + b.exactPredictions, 0) / generalRanking.length)
      : 0,
    avgChallengeWins: generalRanking.length > 0
      ? Math.round(generalRanking.reduce((a, b) => a + b.challengeWins, 0) / generalRanking.length)
      : 0,
  }), [generalRanking]);

  if (!mounted) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Meu Bolão</h1>
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
          <h1 className="text-2xl font-bold">Meu Bolão</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <User size={48} className="text-muted-foreground" />
          <p className="text-muted-foreground text-center">
            Faça login para ver suas atividades
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
        <h1 className="text-xl sm:text-2xl font-bold">Meu Bolão</h1>
        
        {/* Desktop tabs */}
        <div className="hidden md:flex items-center gap-2">
          {(["resumo", "chutes", "desafios", "ligas"] as const).map((tab) => (
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
              {tab === "resumo" && "Resumo"}
              {tab === "chutes" && "Meus Chutes"}
              {tab === "desafios" && "Desafios"}
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
              { value: "resumo", label: "Resumo" },
              { value: "chutes", label: "Chutes" },
              { value: "desafios", label: "Desafios" },
              { value: "ligas", label: "Ligas" },
            ]}
          />
        </div>
      </div>

      {/* Tab: Resumo */}
      {tabMode === "resumo" && (
        <div className="space-y-8">
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                          width: `${Math.min(100, averageStats.avgPoints > 0 ? (userMetrics.totalPoints / (averageStats.avgPoints * 2)) * 100 : 0)}%`,
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
                          width: `${Math.min(100, averageStats.avgExacts > 0 ? (userMetrics.exactPredictions / (averageStats.avgExacts * 2)) * 100 : 0)}%`,
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
                          width: `${Math.min(100, averageStats.avgChallengeWins > 0 ? (userMetrics.challengeWins / (averageStats.avgChallengeWins * 2)) * 100 : 0)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 bg-card rounded-2xl border border-border/50">
              <TrendUp className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium">Sem estatísticas ainda</p>
              <p className="text-sm text-muted-foreground">
                Faça chutes e desafios para aparecer no ranking
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Meus Chutes */}
      {tabMode === "chutes" && (
        <div className="space-y-8">
          <div className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground text-center">
              Histórico de todos os seus palpites
            </p>
          </div>

          {/* Prediction Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card rounded-2xl border border-border/50 p-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Trophy weight="fill" className="w-5 h-5 text-yellow-500" />
                <span className="text-sm">Total de Pontos</span>
              </div>
              <p className="text-3xl font-bold">{predictionStats.totalPoints}</p>
            </div>

            <div className="bg-card rounded-2xl border border-border/50 p-5">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Target weight="fill" className="w-5 h-5 text-primary" />
                <span className="text-sm">Chutes Feitos</span>
              </div>
              <p className="text-3xl font-bold">
                {predictionStats.done}
                <span className="text-lg font-normal text-muted-foreground">
                  /{predictionStats.total}
                </span>
              </p>
            </div>
          </div>

          {/* Accuracy Stats */}
          <div className="bg-card rounded-2xl border border-border/50 p-5">
            <h3 className="font-semibold mb-4">Seus Acertos</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <CheckCircle weight="fill" className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium">Placares Exatos</p>
                    <p className="text-xs text-muted-foreground">
                      {POINTS.EXACT_SCORE.shared}-{POINTS.EXACT_SCORE.unique} pts cada
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-bold">{predictionStats.exactScoreHits}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <CheckCircle weight="fill" className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium">Resultados</p>
                    <p className="text-xs text-muted-foreground">
                      {POINTS.RESULT.shared}-{POINTS.RESULT.unique} pts cada
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-bold">{predictionStats.resultHits}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <CheckCircle weight="fill" className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="font-medium">Primeiro a Marcar</p>
                    <p className="text-xs text-muted-foreground">
                      {POINTS.FIRST_SCORER.shared}-{POINTS.FIRST_SCORER.unique} pts cada
                    </p>
                  </div>
                </div>
                <p className="text-2xl font-bold">{predictionStats.firstScorerHits}</p>
              </div>
            </div>
          </div>

          {/* Predictions List */}
          {predictedMatches.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-semibold">Histórico de Chutes</h3>
              <div className="flex flex-col gap-6">
                {predictedMatches.map((match) => (
                  <MatchCardWithPrediction
                    key={match.id}
                    match={match}
                    onPredictionChange={handlePredictionChange}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 bg-card rounded-2xl border border-border/50">
              <SneakerMove className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="font-medium">Nenhum chute ainda</p>
              <p className="text-sm text-muted-foreground">
                Use o botão + para fazer seu primeiro palpite
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Desafios */}
      {tabMode === "desafios" && (
        <div className="space-y-8">
          <div className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground text-center">
              Desafios enviados e recebidos
            </p>
          </div>

          {/* Challenge Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card rounded-2xl border border-border/50 p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Trophy weight="fill" className="w-4 h-4 text-yellow-500" />
                <span className="text-xs">Pontos</span>
              </div>
              <p className="text-2xl font-bold">{challengeStats.pointsFromChallenges}</p>
            </div>
            <div className="bg-card rounded-2xl border border-border/50 p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <CheckCircle weight="fill" className="w-4 h-4 text-green-500" />
                <span className="text-xs">Vitórias</span>
              </div>
              <p className="text-2xl font-bold text-green-500">{challengeStats.wins}</p>
            </div>
            <div className="bg-card rounded-2xl border border-border/50 p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <XCircle weight="fill" className="w-4 h-4 text-red-500" />
                <span className="text-xs">Derrotas</span>
              </div>
              <p className="text-2xl font-bold text-red-500">{challengeStats.losses}</p>
            </div>
            <div className="bg-card rounded-2xl border border-border/50 p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Handshake weight="fill" className="w-4 h-4 text-blue-500" />
                <span className="text-xs">Empates</span>
              </div>
              <p className="text-2xl font-bold text-blue-500">{challengeStats.ties}</p>
            </div>
          </div>

          {/* Pending Challenges Received */}
          {userChallenges.received.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Fire className="w-5 h-5 text-orange-500" />
                Desafios Recebidos ({userChallenges.received.length})
              </h3>
              <div className="space-y-3">
                {userChallenges.received.map((challenge) => {
                  const match = getMatchById(challenge.matchId);
                  return (
                    <div
                      key={challenge.id}
                      className="bg-card rounded-2xl border border-orange-500/30 p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                            <span className="text-sm font-bold">
                              {challenge.challengerName.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {challenge.challengerName} te desafiou!
                            </p>
                          </div>
                        </div>
                      </div>
                      {match && (
                        <div className="flex items-center gap-2 mb-3 text-sm">
                          <TeamFlag
                            flag={match.homeTeam.flag}
                            name={match.homeTeam.name}
                            size="sm"
                          />
                          <span>
                            {match.homeTeam.code} vs {match.awayTeam.code}
                          </span>
                          <TeamFlag
                            flag={match.awayTeam.flag}
                            name={match.awayTeam.name}
                            size="sm"
                          />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptChallenge(challenge.id)}
                          className="flex-1"
                        >
                          Aceitar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeclineChallenge(challenge.id)}
                          className="flex-1"
                        >
                          Recusar
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sent Challenges */}
          {userChallenges.sent.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <Sword className="w-5 h-5 text-blue-500" />
                Desafios Enviados ({userChallenges.sent.length})
              </h3>
              <div className="space-y-3">
                {userChallenges.sent.map((challenge) => {
                  const match = getMatchById(challenge.matchId);
                  return (
                    <div
                      key={challenge.id}
                      className="bg-card rounded-2xl border border-border/50 p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            Você desafiou <strong>{challenge.challengedName}</strong>
                          </span>
                        </div>
                        <span
                          className={cn(
                            "text-xs px-2 py-1 rounded-full",
                            challenge.status === "pending"
                              ? "bg-orange-500/10 text-orange-500"
                              : "bg-green-500/10 text-green-500"
                          )}
                        >
                          {challenge.status === "pending" ? "Aguardando" : "Aceito"}
                        </span>
                      </div>
                      {match && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>
                            {match.homeTeam.code} vs {match.awayTeam.code}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Challenges */}
          {userChallenges.completed.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Histórico de Desafios</h3>
              <div className="space-y-3">
                {userChallenges.completed.slice(0, 10).map((challenge) => {
                  const match = getMatchById(challenge.matchId);
                  const isChallenger = challenge.challengerId === userId;
                  const opponentName = isChallenger
                    ? challenge.challengedName
                    : challenge.challengerName;
                  const won =
                    (isChallenger && challenge.winner === "challenger") ||
                    (!isChallenger && challenge.winner === "challenged");
                  const tied = challenge.winner === "tie";

                  return (
                    <div
                      key={challenge.id}
                      className="bg-card rounded-2xl border border-border/50 p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {isChallenger ? "Você" : opponentName} vs{" "}
                            {isChallenger ? opponentName : "Você"}
                          </span>
                        </div>
                        <span
                          className={cn(
                            "text-xs px-2 py-1 rounded-full font-medium",
                            won
                              ? "bg-green-500/10 text-green-500"
                              : tied
                                ? "bg-blue-500/10 text-blue-500"
                                : "bg-red-500/10 text-red-500"
                          )}
                        >
                          {won ? "Vitória" : tied ? "Empate" : "Derrota"}
                        </span>
                      </div>
                      {match && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>
                            {match.homeTeam.code} vs {match.awayTeam.code}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty State */}
          {userChallenges.active.length === 0 &&
            userChallenges.received.length === 0 &&
            userChallenges.completed.length === 0 && (
              <div className="text-center py-8 bg-card rounded-2xl border border-border/50">
                <Fire className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="font-medium">Nenhum desafio ainda</p>
                <p className="text-sm text-muted-foreground">
                  Use o botão + para desafiar seus amigos
                </p>
              </div>
            )}
        </div>
      )}

      {/* Tab: Minhas Ligas */}
      {tabMode === "ligas" && (
        <div className="space-y-8">
          <div className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground text-center">
              Ligas que você participa
            </p>
          </div>

          {userLeagues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userLeagues.map((league) => (
                <LeagueCard
                  key={league.id}
                  league={{
                    id: league.id,
                    name: league.name,
                    description: league.description || undefined,
                    inviteCode: league.inviteCode,
                    createdBy: league.createdBy,
                    createdByName: league.createdByName,
                    memberCount: league.memberCount,
                    createdAt: league.createdAt,
                  }}
                  members={leagueMembers[league.id] || []}
                  currentUserId={userId}
                  userPosition={null}
                  onClick={() => router.push(`/ranking?liga=${league.id}`)}
                  onDelete={handleDeleteLeague}
                  onLeave={handleLeaveLeague}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <FlagBanner size={48} className="text-muted-foreground" />
              <p className="text-muted-foreground text-center">
                Você ainda não participa de nenhuma liga
              </p>
              <Button variant="outline" asChild>
                <a href="/ligas">
                  <UserPlus size={16} className="mr-2" />
                  Entrar ou Criar Liga
                </a>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
