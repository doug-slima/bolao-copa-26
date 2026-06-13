"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { SneakerMove } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { PredictionForm, TeamFlag } from "@/components/bolao";
import type { Match, Prediction } from "@/types";
import { getPrediction } from "@/lib/predictions-store";
import { isPredictionDeadlinePassed } from "@/lib/scoring";
import { cn } from "@/lib/utils";

interface MatchDetailClientProps {
  match: Match;
}

export function MatchDetailClient({ match }: MatchDetailClientProps) {
  const { isSignedIn, userId } = useAuth();
  const [predictionOpen, setPredictionOpen] = useState(false);
  const [currentPrediction, setCurrentPrediction] = useState<Prediction | null>(
    userId ? getPrediction(match.id, userId) : null
  );

  const isLocked = isPredictionDeadlinePassed(match.date);

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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
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

          {/* VS or Score */}
          <div className="shrink-0">
            {match.score ? (
              <div className="flex items-center gap-3 bg-muted rounded-2xl px-6 py-3">
                <span className="text-4xl font-bold tabular-nums">
                  {match.score.home}
                </span>
                <span className="text-2xl text-muted-foreground">-</span>
                <span className="text-4xl font-bold tabular-nums">
                  {match.score.away}
                </span>
              </div>
            ) : (
              <div className="text-2xl font-bold text-muted-foreground">vs</div>
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

      {/* Current Prediction Display */}
      {currentPrediction && (
        <div className="bg-card rounded-2xl border border-border/50 p-6">
          <div className="text-center space-y-4">
            <h3 className="font-semibold">Seu Chute</h3>
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
            {!isLocked && (
              <Button
                variant="outline"
                onClick={() => setPredictionOpen(true)}
                className="rounded-full"
              >
                Editar Chute
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Prediction CTA */}
      {!currentPrediction && (
        <div className="bg-card rounded-2xl border border-border/50 p-6">
          <div className="text-center space-y-4">
            <SneakerMove size={40} weight="duotone" className="mx-auto text-primary" />
            <h3 className="font-semibold">Faça seu Chute!</h3>
            <p className="text-sm text-muted-foreground">
              {isLocked
                ? "O prazo para chutes neste jogo já encerrou."
                : "Dê seu palpite para este jogo e ganhe pontos!"}
            </p>
            {!isSignedIn ? (
              <SignInButton mode="modal">
                <Button className="rounded-full">
                  Entrar para Chutar
                </Button>
              </SignInButton>
            ) : !isLocked ? (
              <Button
                onClick={() => setPredictionOpen(true)}
                className="rounded-full"
              >
                <SneakerMove size={20} weight="bold" className="mr-2" />
                Fazer Chute
              </Button>
            ) : null}
          </div>
        </div>
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
    </div>
  );
}
