"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import {
  Fire,
  Trophy,
  Clock,
  CheckCircle,
  XCircle,
  Handshake,
  Sword,
  ArrowLeft,
} from "@phosphor-icons/react";
import { TeamFlag } from "@/components/bolao/team-flag";
import { PredictionForm } from "@/components/bolao/prediction-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { Match, Challenge } from "@/types";
import {
  createChallenge,
  getChallengesByUser,
  getPendingChallengesForUser,
  acceptChallenge,
  declineChallenge,
  getChallengeStats,
  CHALLENGE_POINTS,
} from "@/lib/challenges-store";
import { getPrediction } from "@/lib/predictions-store";
import { isPredictionDeadlinePassed } from "@/lib/scoring";

type ViewMode = "rules" | "my-challenges" | "create";
type CreateStep = "select" | "need-prediction" | "confirmation";

interface DesafioPageClientProps {
  matches: Match[];
}

const mockFriends = [
  { id: "friend_1", name: "João" },
  { id: "friend_2", name: "Maria" },
  { id: "friend_3", name: "Pedro" },
  { id: "friend_4", name: "Ana" },
  { id: "friend_5", name: "Lucas" },
];

export function DesafioPageClient({ matches }: DesafioPageClientProps) {
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const [viewMode, setViewMode] = useState<ViewMode>("create");
  const [createStep, setCreateStep] = useState<CreateStep>("select");
  const [mounted, setMounted] = useState(false);

  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [challenges, setChallenges] = useState<ReturnType<
    typeof getChallengesByUser
  > | null>(null);
  const [pendingChallenges, setPendingChallenges] = useState<Challenge[]>([]);
  const [stats, setStats] = useState<ReturnType<typeof getChallengeStats> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPredictionForm, setShowPredictionForm] = useState(false);
  const [confirmationData, setConfirmationData] = useState<{
    friendName: string;
    matchTeams: string;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && userId) {
      refreshData();
    }
  }, [mounted, userId]);

  const refreshData = () => {
    if (!userId) return;
    setChallenges(getChallengesByUser(userId));
    setPendingChallenges(getPendingChallengesForUser(userId));
    setStats(getChallengeStats(userId));
  };

  const availableMatches = useMemo(() => {
    return matches.filter((m) => !isPredictionDeadlinePassed(m.date));
  }, [matches]);

  const selectedMatchData = useMemo(() => {
    return availableMatches.find((m) => m.id === selectedMatch);
  }, [availableMatches, selectedMatch]);

  const userHasPrediction = useMemo(() => {
    if (!userId || !selectedMatch) return false;
    const prediction = getPrediction(selectedMatch, userId);
    return prediction !== null;
  }, [userId, selectedMatch]);

  const handleCreateChallenge = () => {
    if (!userId || !selectedFriend || !selectedMatch) return;

    setError(null);

    if (!userHasPrediction) {
      setShowPredictionForm(true);
      return;
    }

    sendChallenge();
  };

  const sendChallenge = () => {
    if (!userId || !selectedFriend || !selectedMatch) return;

    const friendData = mockFriends.find((f) => f.id === selectedFriend);
    if (!friendData) return;

    const result = createChallenge({
      matchId: selectedMatch,
      challengerId: userId,
      challengerName: user?.firstName || "Você",
      challengedId: selectedFriend,
      challengedName: friendData.name,
    });

    if (result.success) {
      setConfirmationData({
        friendName: friendData.name,
        matchTeams: `${selectedMatchData?.homeTeam.code} vs ${selectedMatchData?.awayTeam.code}`,
      });
      setCreateStep("confirmation");
      refreshData();
    } else {
      setError(result.error || "Erro ao criar desafio.");
    }
  };

  const handlePredictionSaved = () => {
    setShowPredictionForm(false);
    sendChallenge();
  };

  const resetCreateFlow = () => {
    setSelectedFriend(null);
    setSelectedMatch(null);
    setConfirmationData(null);
    setCreateStep("select");
    setError(null);
  };

  const handleAcceptChallenge = (challengeId: string) => {
    if (!userId) return;
    const result = acceptChallenge(challengeId, userId);
    if (result.success) {
      refreshData();
    }
  };

  const handleDeclineChallenge = (challengeId: string) => {
    if (!userId) return;
    const result = declineChallenge(challengeId, userId);
    if (result.success) {
      refreshData();
    }
  };

  const getMatchById = (matchId: string) => {
    return matches.find((m) => m.id === matchId);
  };

  if (!mounted) {
    return (
      <div className="space-y-10">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold">Desafie</h1>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-pulse text-muted-foreground">
            Carregando...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header with title and view mode buttons */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-bold">Desafie</h1>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setViewMode("rules")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full transition-all",
              viewMode === "rules"
                ? "bg-foreground text-background"
                : "border border-white/40 text-muted-foreground hover:text-foreground hover:border-white/70"
            )}
          >
            Como Funciona?
          </button>
          <button
            onClick={() => setViewMode("my-challenges")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full transition-all",
              viewMode === "my-challenges"
                ? "bg-foreground text-background"
                : "border border-white/40 text-muted-foreground hover:text-foreground hover:border-white/70"
            )}
          >
            Meus Desafios
          </button>
          <button
            onClick={() => setViewMode("create")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full transition-all",
              viewMode === "create"
                ? "bg-foreground text-background"
                : "border border-white/40 text-muted-foreground hover:text-foreground hover:border-white/70"
            )}
          >
            Criar Desafio
          </button>
        </div>
      </div>

      {/* Auth Check */}
      {!isSignedIn && viewMode !== "rules" ? (
        <div className="bg-card rounded-2xl border border-border/50 p-6 text-center space-y-4">
          <Fire className="w-12 h-12 mx-auto text-muted-foreground" />
          <div>
            <p className="font-medium">Faça login para desafiar</p>
            <p className="text-sm text-muted-foreground">
              Você precisa estar logado para desafiar seus amigos
            </p>
          </div>
          <SignInButton mode="modal">
            <Button>Entrar</Button>
          </SignInButton>
        </div>
      ) : (
        <>
          {/* Rules View */}
          {viewMode === "rules" && (
            <div className="space-y-8">
              <div className="flex flex-col items-center gap-3">
                <p className="text-muted-foreground text-center">
                  Entenda como funcionam os desafios!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1 - Como funciona */}
                <div className="bg-card rounded-2xl border border-border/50 p-5 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Sword weight="bold" className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm">Como funciona</h3>
                  </div>
                  <ul className="text-muted-foreground text-xs space-y-2 list-disc list-inside flex-1">
                    <li>Escolha um amigo e um jogo</li>
                    <li>Se você não tiver chute, faça antes de enviar</li>
                    <li>Seu amigo recebe e pode aceitar ou recusar</li>
                    <li>Quem fizer mais pontos no jogo ganha o desafio</li>
                  </ul>
                </div>

                {/* Card 2 - Pontuação */}
                <div className="bg-card rounded-2xl border border-border/50 p-5 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Trophy weight="bold" className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm">Pontuação</h3>
                  </div>
                  <ul className="text-muted-foreground text-xs space-y-2 list-disc list-inside flex-1">
                    <li>
                      Você faz mais pontos no jogo ={" "}
                      <strong className="text-green-500">+{CHALLENGE_POINTS.WIN} pts bônus</strong>
                    </li>
                    <li>
                      Seu amigo faz mais pontos ={" "}
                      <strong className="text-green-500">+{CHALLENGE_POINTS.WIN} pts para ele</strong>
                    </li>
                    <li>
                      Empate em pontos ={" "}
                      <strong className="text-blue-500">+{CHALLENGE_POINTS.TIE} pt cada</strong>
                    </li>
                    <li>
                      Ambos zeram ={" "}
                      <strong className="text-red-500">{CHALLENGE_POINTS.BOTH_ZERO} pt cada</strong>
                    </li>
                  </ul>
                </div>

                {/* Card 3 - Regras */}
                <div className="bg-card rounded-2xl border border-border/50 p-5 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                      <Clock weight="bold" className="w-4 h-4 text-orange-500" />
                    </div>
                    <h3 className="font-semibold text-sm">Regras</h3>
                  </div>
                  <ul className="text-muted-foreground text-xs space-y-2 list-disc list-inside flex-1">
                    <li>Um desafio por jogo por amigo</li>
                    <li>Desafios pendentes expiram com o deadline do jogo</li>
                    <li>Se alguém não tiver chute, desafio é anulado</li>
                    <li>Pontos do desafio são extras aos do chute</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* My Challenges View */}
          {viewMode === "my-challenges" && (
            <div className="space-y-8">
              <div className="flex flex-col items-center gap-3">
                <p className="text-muted-foreground text-center">
                  Acompanhe seus desafios e estatísticas!
                </p>
              </div>

              {/* Stats Grid */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-card rounded-2xl border border-border/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Trophy weight="fill" className="w-4 h-4 text-yellow-500" />
                      <span className="text-xs">Pontos</span>
                    </div>
                    <p className="text-2xl font-bold">{stats.pointsFromChallenges}</p>
                  </div>
                  <div className="bg-card rounded-2xl border border-border/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <CheckCircle weight="fill" className="w-4 h-4 text-green-500" />
                      <span className="text-xs">Vitórias</span>
                    </div>
                    <p className="text-2xl font-bold text-green-500">{stats.wins}</p>
                  </div>
                  <div className="bg-card rounded-2xl border border-border/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <XCircle weight="fill" className="w-4 h-4 text-red-500" />
                      <span className="text-xs">Derrotas</span>
                    </div>
                    <p className="text-2xl font-bold text-red-500">{stats.losses}</p>
                  </div>
                  <div className="bg-card rounded-2xl border border-border/50 p-4">
                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                      <Handshake weight="fill" className="w-4 h-4 text-blue-500" />
                      <span className="text-xs">Empates</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-500">{stats.ties}</p>
                  </div>
                </div>
              )}

              {/* Pending Challenges Received */}
              {pendingChallenges.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Fire className="w-5 h-5 text-orange-500" />
                    Desafios Recebidos
                  </h3>
                  <div className="space-y-3">
                    {pendingChallenges.map((challenge) => {
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

              {/* Active Challenges */}
              {challenges && challenges.active.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-semibold">Desafios Ativos</h3>
                  <div className="space-y-3">
                    {challenges.active.map((challenge) => {
                      const match = getMatchById(challenge.matchId);
                      const isChallenger = challenge.challengerId === userId;
                      const opponentName = isChallenger
                        ? challenge.challengedName
                        : challenge.challengerName;

                      return (
                        <div
                          key={challenge.id}
                          className="bg-card rounded-2xl border border-border/50 p-4"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">
                                {isChallenger ? "Você desafiou" : "Desafiado por"}{" "}
                                <strong>{opponentName}</strong>
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
                              {challenge.status === "pending"
                                ? "Aguardando"
                                : "Aceito"}
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
              {challenges &&
                challenges.active.length === 0 &&
                pendingChallenges.length === 0 && (
                  <div className="text-center py-12 bg-card rounded-2xl border border-border/50">
                    <Fire className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <p className="font-medium">Nenhum desafio ativo</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Crie um desafio para competir com seus amigos!
                    </p>
                    <Button onClick={() => setViewMode("create")}>
                      Criar Desafio
                    </Button>
                  </div>
                )}
            </div>
          )}

          {/* Create Challenge View */}
          {viewMode === "create" && (
            <>
              {/* Step: Selection */}
              {createStep === "select" && (
                <div className="space-y-8">
                  <div className="flex flex-col items-center gap-3">
                    <p className="text-muted-foreground text-center">
                      Escolha um amigo, um jogo e uma categoria!
                    </p>
                  </div>

                  {/* Step 1: Select Friend */}
                  <div className="bg-card rounded-2xl border border-border/50 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-background text-xs font-bold">
                        1
                      </div>
                      <h3 className="font-semibold text-sm">Escolha um amigo</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {mockFriends.map((friend) => (
                        <button
                          key={friend.id}
                          onClick={() => setSelectedFriend(friend.id)}
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-full transition-colors",
                            selectedFriend === friend.id
                              ? "bg-foreground text-background"
                              : "bg-muted hover:bg-muted/80"
                          )}
                        >
                          <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                            {friend.name.charAt(0)}
                          </div>
                          <span className="text-sm">{friend.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Select Match */}
                  <div className="bg-card rounded-2xl border border-border/50 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <div
                        className={cn(
                          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                          selectedFriend
                            ? "bg-primary text-background"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        2
                      </div>
                      <h3 className="font-semibold text-sm">Escolha o jogo</h3>
                    </div>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {availableMatches.length > 0 ? (
                        availableMatches.map((match) => (
                          <button
                            key={match.id}
                            onClick={() => setSelectedMatch(match.id)}
                            disabled={!selectedFriend}
                            className={cn(
                              "w-full flex items-center justify-between p-3 rounded-xl transition-colors",
                              selectedMatch === match.id
                                ? "bg-foreground text-background"
                                : "bg-muted hover:bg-muted/80",
                              !selectedFriend && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <TeamFlag
                                flag={match.homeTeam.flag}
                                name={match.homeTeam.name}
                                size="sm"
                              />
                              <span className="text-sm font-medium">
                                {match.homeTeam.code} vs {match.awayTeam.code}
                              </span>
                              <TeamFlag
                                flag={match.awayTeam.flag}
                                name={match.awayTeam.name}
                                size="sm"
                              />
                            </div>
                            <span className="text-xs opacity-70">
                              {new Intl.DateTimeFormat("pt-BR", {
                                day: "2-digit",
                                month: "short",
                              }).format(match.date)}
                            </span>
                          </button>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Nenhum jogo disponível no momento
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Summary & Submit */}
                  {selectedFriend && selectedMatch && (
                    <div className="bg-primary/10 rounded-2xl p-5 space-y-4">
                      <h3 className="font-semibold text-sm">Resumo do Desafio</h3>
                      <div className="text-sm space-y-1">
                        <p>
                          <span className="text-muted-foreground">Amigo:</span>{" "}
                          <strong>
                            {mockFriends.find((f) => f.id === selectedFriend)?.name}
                          </strong>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Jogo:</span>{" "}
                          <strong>
                            {selectedMatchData?.homeTeam.code} vs{" "}
                            {selectedMatchData?.awayTeam.code}
                          </strong>
                        </p>
                      </div>
                      {!userHasPrediction && (
                        <div className="flex items-center gap-2 text-orange-500 text-xs">
                          <Clock weight="bold" className="w-4 h-4" />
                          Você ainda não fez um chute neste jogo. Será necessário fazer antes de enviar o desafio.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Error Message */}
                  {error && (
                    <div className="flex items-center gap-2 text-destructive text-sm justify-center">
                      <XCircle weight="bold" className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  {/* Submit Button */}
                  <Button
                    className="w-full"
                    size="lg"
                    disabled={!selectedFriend || !selectedMatch}
                    onClick={handleCreateChallenge}
                  >
                    <Fire className="w-5 h-5 mr-2" />
                    {userHasPrediction ? "Enviar Desafio" : "Fazer Chute e Enviar Desafio"}
                  </Button>
                </div>
              )}

              {/* Step: Confirmation */}
              {createStep === "confirmation" && confirmationData && (
                <div className="space-y-8">
                  <div className="flex flex-col items-center gap-6 py-8">
                    <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                      <CheckCircle weight="fill" className="w-12 h-12 text-green-500" />
                    </div>
                    <div className="text-center space-y-2">
                      <h2 className="text-xl font-bold">Desafio Enviado!</h2>
                      <p className="text-muted-foreground">
                        Seu desafio foi enviado com sucesso para{" "}
                        <strong>{confirmationData.friendName}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="bg-card rounded-2xl border border-border/50 p-5 space-y-3">
                    <h3 className="font-semibold text-sm">Detalhes do Desafio</h3>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amigo</span>
                        <span className="font-medium">{confirmationData.friendName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Jogo</span>
                        <span className="font-medium">{confirmationData.matchTeams}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-xl p-4 text-center text-sm text-muted-foreground">
                    <p>
                      <strong>{confirmationData.friendName}</strong> receberá uma notificação
                      e poderá aceitar ou recusar o desafio.
                    </p>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={resetCreateFlow}
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Criar Outro Desafio
                  </Button>
                </div>
              )}

              {/* Prediction Form Modal */}
              {selectedMatchData && (
                <PredictionForm
                  match={selectedMatchData}
                  open={showPredictionForm}
                  onOpenChange={setShowPredictionForm}
                  onSave={handlePredictionSaved}
                  submitButtonText="Enviar Desafio"
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
