"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { SneakerMove, Fire, ArrowLeft, Prohibit } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { PredictionForm, ChallengeForm, TeamFlag, MatchStatsCard } from "@/components/bolao";
import type { Match, Prediction } from "@/types";
import { getPrediction } from "@/lib/db/predictions";
import { isPredictionDeadlinePassed } from "@/lib/scoring";

interface MatchDetailClientProps {
  match: Match;
}

export function MatchDetailClient({ match }: MatchDetailClientProps) {
  const { isSignedIn, userId } = useAuth();
  const router = useRouter();
  const [predictionOpen, setPredictionOpen] = useState(false);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [currentPrediction, setCurrentPrediction] = useState<Prediction | null>(null);

  useEffect(() => {
    if (userId) {
      getPrediction(match.id, userId).then((prediction) => {
        if (prediction) {
          setCurrentPrediction({
            id: prediction.id,
            matchId: prediction.matchId,
            userId: prediction.userId,
            homeScore: prediction.homeScore,
            awayScore: prediction.awayScore,
            firstToScore: prediction.firstToScore,
            createdAt: prediction.createdAt,
            updatedAt: prediction.updatedAt || undefined,
          });
        }
      });
    }
  }, [userId, match.id]);

  const isLocked = isPredictionDeadlinePassed(match.date);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const matchDay = new Date(match.date);
  matchDay.setHours(0, 0, 0, 0);
  const isPastMatch = matchDay.getTime() < today.getTime();

  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(match.date);

  const formattedTime = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(match.date);

  const handlePredictionSave = (prediction: Prediction) => {
    setCurrentPrediction(prediction);
  };

  const handleChallenge = () => {
    setChallengeOpen(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={20} weight="bold" />
        <span className="text-sm font-medium">Voltar</span>
      </button>

      {/* Match Header */}
      <div className="bg-card rounded-2xl border border-border/50 p-6">
        {/* Stage badge */}
        <div className="text-center mb-6">
          <span className="inline-block px-3 py-1 bg-muted rounded-full text-xs font-medium text-muted-foreground">
            {match.group ? `Grupo ${match.group}` : match.stage}
          </span>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between gap-4 mb-6">
          {/* Home */}
          <div className="flex-1 text-center">
            <div className="flex justify-center mb-2">
              <TeamFlag flag={match.homeTeam.flag} name={match.homeTeam.name} size="xl" />
            </div>
            <h2 className="font-semibold text-lg">{match.homeTeam.name}</h2>
            <p className="text-sm text-muted-foreground">{match.homeTeam.code}</p>
          </div>

          {/* Score */}
          <div className="shrink-0">
            {isPastMatch || match.status === "live" ? (
              <div className="flex items-center gap-3 bg-muted rounded-2xl px-6 py-3">
                <span className="text-4xl font-bold tabular-nums">
                  {match.score?.home ?? 0}
                </span>
                <span className="text-2xl text-muted-foreground">-</span>
                <span className="text-4xl font-bold tabular-nums">
                  {match.score?.away ?? 0}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-muted rounded-2xl px-6 py-3">
                <span className="text-4xl font-bold tabular-nums text-muted-foreground">
                  ?
                </span>
                <span className="text-2xl text-muted-foreground">-</span>
                <span className="text-4xl font-bold tabular-nums text-muted-foreground">
                  ?
                </span>
              </div>
            )}
          </div>

          {/* Away */}
          <div className="flex-1 text-center">
            <div className="flex justify-center mb-2">
              <TeamFlag flag={match.awayTeam.flag} name={match.awayTeam.name} size="xl" />
            </div>
            <h2 className="font-semibold text-lg">{match.awayTeam.name}</h2>
            <p className="text-sm text-muted-foreground">{match.awayTeam.code}</p>
          </div>
        </div>

        {/* Match Info */}
        <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground">
          <p className="capitalize">{formattedDate}</p>
          <p className="font-medium text-foreground">{formattedTime}</p>
          {match.venue && (
            <p>
              {match.venue}{match.city ? ` • ${match.city}` : ""}
            </p>
          )}
        </div>
      </div>

      {isLocked ? (
        <>
          {/* Danger Pill - Locked */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 rounded-lg text-sm">
              <Prohibit size={16} weight="bold" />
              <span>Chutes e desafios encerrados para este jogo.</span>
            </div>
          </div>

          {/* User's Prediction Card (if exists) */}
          {currentPrediction && (
            <div className="bg-card rounded-2xl border border-border/50 p-6">
              <div className="text-center space-y-4">
                <SneakerMove size={36} weight="duotone" className="mx-auto" />
                <p className="text-foreground font-medium">Seu Chute</p>
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">{match.homeTeam.code}</p>
                    <p className="text-3xl font-bold">{currentPrediction.homeScore}</p>
                  </div>
                  <span className="text-xl text-muted-foreground">×</span>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">{match.awayTeam.code}</p>
                    <p className="text-3xl font-bold">{currentPrediction.awayScore}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Primeiro a marcar:{" "}
                  <span className="font-medium text-foreground">
                    {currentPrediction.firstToScore === "home"
                      ? match.homeTeam.name
                      : currentPrediction.firstToScore === "away"
                        ? match.awayTeam.name
                        : "Nenhum (0×0)"}
                  </span>
                </p>
              </div>
            </div>
          )}

          {/* No Prediction Message */}
          {!currentPrediction && isSignedIn && (
            <div className="bg-card rounded-2xl border border-border/50 p-6">
              <div className="text-center space-y-2">
                <SneakerMove size={36} weight="duotone" className="mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Você não fez um chute para este jogo.</p>
              </div>
            </div>
          )}

          {/* Match Stats Card */}
          <MatchStatsCard match={match} userLeagueId={null} />
        </>
      ) : (
        <>
          {/* CTA Cards */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Chute Card */}
            <div className="bg-card rounded-2xl border border-border/50 p-6">
              <div className="text-center space-y-4">
                <SneakerMove size={36} weight="duotone" className="mx-auto" />
                {currentPrediction ? (
                  <>
                    <p className="text-foreground">Seu Chute</p>
                    <div className="flex items-center justify-center gap-3">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">{match.homeTeam.code}</p>
                        <p className="text-2xl font-bold">{currentPrediction.homeScore}</p>
                      </div>
                      <span className="text-lg text-muted-foreground">×</span>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">{match.awayTeam.code}</p>
                        <p className="text-2xl font-bold">{currentPrediction.awayScore}</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setPredictionOpen(true)}
                      className="rounded-full w-full h-12 text-base"
                    >
                      Editar Chute
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="text-foreground">Dê seu chute e ganhe pontos.</p>
                    {!isSignedIn ? (
                      <SignInButton mode="modal">
                        <Button className="rounded-full w-full h-12 text-base">
                          Entrar para Chutar
                        </Button>
                      </SignInButton>
                    ) : (
                      <Button
                        onClick={() => setPredictionOpen(true)}
                        className="rounded-full w-full h-12 text-base"
                      >
                        Fazer Chute
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Desafio Card */}
            <div className="bg-card rounded-2xl border border-border/50 p-6">
              <div className="text-center space-y-4">
                <Fire size={36} weight="duotone" className="mx-auto" />
                <p className="text-foreground">
                  Desafie seus amigos neste jogo.
                </p>
                {!isSignedIn ? (
                  <SignInButton mode="modal">
                    <Button className="rounded-full w-full h-12 text-base">
                      Entrar para Desafiar
                    </Button>
                  </SignInButton>
                ) : (
                  <Button
                    onClick={handleChallenge}
                    className="rounded-full w-full h-12 text-base"
                  >
                    Criar Desafio
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/10 text-yellow-500 rounded-lg text-sm">
              <span>⚠️</span>
              <span>Chutes e desafios aceitos até 5min antes do jogo.</span>
            </div>
          </div>
        </>
      )}

      {/* Prediction Form Dialog */}
      {isSignedIn && (
        <PredictionForm
          match={match}
          open={predictionOpen}
          onOpenChange={setPredictionOpen}
          onSave={handlePredictionSave}
        />
      )}

      {/* Challenge Form Dialog */}
      {isSignedIn && (
        <ChallengeForm
          match={match}
          open={challengeOpen}
          onOpenChange={setChallengeOpen}
        />
      )}
    </div>
  );
}
