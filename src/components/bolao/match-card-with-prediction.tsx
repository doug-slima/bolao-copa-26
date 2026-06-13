"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Clock, Check, SneakerMove } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { TeamFlag } from "./team-flag";
import { PredictionForm } from "./prediction-form";
import { Badge } from "@/components/ui/badge";
import type { Match, Prediction } from "@/types";
import { getPrediction } from "@/lib/predictions-store";
import { getTimeUntilDeadline, isPredictionDeadlinePassed } from "@/lib/scoring";

interface MatchCardWithPredictionProps {
  match: Match;
  className?: string;
  onPredictionChange?: (prediction: Prediction | null) => void;
}

export function MatchCardWithPrediction({
  match,
  className,
  onPredictionChange,
}: MatchCardWithPredictionProps) {
  const { userId, isSignedIn } = useAuth();
  const [formOpen, setFormOpen] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && userId) {
      const existing = getPrediction(match.id, userId);
      setPrediction(existing);
    }
  }, [mounted, userId, match.id]);

  const deadline = getTimeUntilDeadline(match.date);
  const isLocked = isPredictionDeadlinePassed(match.date);
  const hasExistingPrediction = prediction !== null;

  const formattedTime = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(match.date);

  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(match.date);

  const handleCardClick = () => {
    if (isSignedIn && !isLocked) {
      setFormOpen(true);
    }
  };

  const handlePredictionSave = (newPrediction: Prediction) => {
    setPrediction(newPrediction);
    onPredictionChange?.(newPrediction);
  };

  const getResultLabel = (): string => {
    if (!prediction) return "";
    if (prediction.homeScore > prediction.awayScore) return "Vitória casa";
    if (prediction.awayScore > prediction.homeScore) return "Vitória fora";
    return "Empate";
  };

  const getFirstScorerLabel = (): string => {
    if (!prediction) return "";
    if (prediction.firstToScore === "home") return match.homeTeam.code;
    if (prediction.firstToScore === "away") return match.awayTeam.code;
    return "0×0";
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className={cn(
          "bg-card rounded-2xl border border-border/50",
          "transition-all duration-200",
          !isLocked && isSignedIn && "hover:border-border hover:shadow-xl cursor-pointer",
          match.status === "live" && "border-green-500/50 bg-green-500/5",
          className
        )}
      >
        {/* Header with Status */}
        <div className="px-4 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {match.group ? `Grupo ${match.group}` : match.stage}
            </span>
            {match.status === "live" && (
              <span className="flex items-center gap-1 text-xs text-green-500">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                AO VIVO
              </span>
            )}
          </div>

          {mounted && (
            <div className="flex items-center gap-2">
              {hasExistingPrediction ? (
                <Badge
                  variant="secondary"
                  className="bg-green-500/10 text-green-600 border-green-500/20"
                >
                  <Check weight="bold" className="w-3 h-3 mr-1" />
                  Chute feito
                </Badge>
              ) : isLocked ? (
                <Badge variant="secondary" className="text-muted-foreground">
                  Encerrado
                </Badge>
              ) : (
                <Badge variant="outline" className="text-primary border-primary/30">
                  <Clock weight="bold" className="w-3 h-3 mr-1" />
                  {deadline.formatted}
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Date/Time */}
        <div className="px-4 pb-3">
          <p className="text-xs text-muted-foreground capitalize">
            {formattedDate} • {formattedTime}
          </p>
        </div>

        {/* Teams */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between gap-4">
            {/* Home Team */}
            <div className="flex-1 flex items-center gap-3">
              <TeamFlag
                flag={match.homeTeam.flag}
                name={match.homeTeam.name}
                size="lg"
              />
              <div className="min-w-0">
                <p className="font-medium truncate">{match.homeTeam.name}</p>
                <p className="text-xs text-muted-foreground">
                  {match.homeTeam.code}
                </p>
              </div>
            </div>

            {/* Score/Prediction Preview */}
            <div className="shrink-0">
              {match.score ? (
                <div className="flex items-center gap-2 bg-muted rounded-xl px-4 py-2">
                  <span className="text-2xl font-bold tabular-nums">
                    {match.score.home}
                  </span>
                  <span className="text-muted-foreground">-</span>
                  <span className="text-2xl font-bold tabular-nums">
                    {match.score.away}
                  </span>
                </div>
              ) : mounted && hasExistingPrediction ? (
                <div className="flex flex-col items-center bg-primary/10 rounded-xl px-4 py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl font-bold tabular-nums text-primary">
                      {prediction.homeScore}
                    </span>
                    <span className="text-primary/60">-</span>
                    <span className="text-xl font-bold tabular-nums text-primary">
                      {prediction.awayScore}
                    </span>
                  </div>
                  <span className="text-[10px] text-primary/80 font-medium">
                    Seu chute
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center bg-muted rounded-xl px-4 py-2 min-w-[80px]">
                  {isSignedIn && !isLocked ? (
                    <>
                      <SneakerMove className="w-5 h-5 text-muted-foreground mb-0.5" />
                      <span className="text-[10px] text-muted-foreground font-medium">
                        Fazer chute
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground">
                      vs
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="flex-1 flex items-center gap-3 justify-end">
              <div className="min-w-0 text-right">
                <p className="font-medium truncate">{match.awayTeam.name}</p>
                <p className="text-xs text-muted-foreground">
                  {match.awayTeam.code}
                </p>
              </div>
              <TeamFlag
                flag={match.awayTeam.flag}
                name={match.awayTeam.name}
                size="lg"
              />
            </div>
          </div>
        </div>

        {/* Prediction Details (if exists) */}
        {mounted && hasExistingPrediction && (
          <div className="px-4 pb-4">
            <div className="flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span>Resultado:</span>
                <span className="font-medium text-foreground">
                  {getResultLabel()}
                </span>
              </div>
              <div className="w-px h-3 bg-border" />
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span>1º gol:</span>
                <span className="font-medium text-foreground">
                  {getFirstScorerLabel()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            {match.venue && match.venue !== "A definir"
              ? `${match.venue}${match.city ? ` • ${match.city}` : ""}`
              : "Local a confirmar"}
          </p>
        </div>
      </div>

      {/* Prediction Form Modal */}
      <PredictionForm
        match={match}
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={handlePredictionSave}
      />
    </>
  );
}
