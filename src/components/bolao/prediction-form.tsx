"use client";

import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { Plus, Minus, Clock, Check, X } from "@phosphor-icons/react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "radix-ui";
import { Button } from "@/components/ui/button";
import { TeamFlag } from "./team-flag";
import { cn } from "@/lib/utils";
import { formatDateWithTime } from "@/lib/date-utils";
import type { Match, FirstToScore, Prediction } from "@/types";
import {
  savePrediction as dbSavePrediction,
  getPrediction as dbGetPrediction,
  deletePrediction as dbDeletePrediction,
  type DbPrediction,
} from "@/lib/db/predictions";
import {
  getTimeUntilDeadline,
  isPredictionDeadlinePassed,
  POINTS,
} from "@/lib/scoring";

interface PredictionFormProps {
  match: Match;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (prediction: Prediction) => void;
  submitButtonText?: string;
}

export function PredictionForm({
  match,
  open,
  onOpenChange,
  onSave,
  submitButtonText,
}: PredictionFormProps) {
  const { userId } = useAuth();
  const { user } = useUser();
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [firstToScore, setFirstToScore] = useState<FirstToScore>("home");
  const [existingPrediction, setExistingPrediction] = useState<DbPrediction | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const deadline = getTimeUntilDeadline(match.date);
  const isLocked = isPredictionDeadlinePassed(match.date);

  useEffect(() => {
    if (open && userId) {
      setLoading(true);
      dbGetPrediction(match.id, userId).then((existing) => {
        if (existing) {
          setExistingPrediction(existing);
          setHomeScore(existing.homeScore);
          setAwayScore(existing.awayScore);
          setFirstToScore(existing.firstToScore);
        } else {
          setExistingPrediction(null);
          setHomeScore(0);
          setAwayScore(0);
          setFirstToScore("home");
        }
        setError(null);
        setSuccess(false);
        setLoading(false);
      });
    }
  }, [open, userId, match.id]);

  useEffect(() => {
    if (homeScore === 0 && awayScore === 0) {
      setFirstToScore("none");
    } else if (firstToScore === "none") {
      setFirstToScore("home");
    }
  }, [homeScore, awayScore, firstToScore]);

  const handleSave = async () => {
    if (!userId || !user) {
      setError("Você precisa estar logado para fazer um chute.");
      return;
    }

    setSaving(true);
    setError(null);

    const result = await dbSavePrediction(
      {
        matchId: match.id,
        homeScore,
        awayScore,
        firstToScore,
      },
      match.date
    );

    setSaving(false);

    if (result.success && result.prediction) {
      setSuccess(true);
      setExistingPrediction(result.prediction);
      const predictionForCallback: Prediction = {
        id: result.prediction.id,
        matchId: result.prediction.matchId,
        userId: result.prediction.userId,
        homeScore: result.prediction.homeScore,
        awayScore: result.prediction.awayScore,
        firstToScore: result.prediction.firstToScore,
        createdAt: result.prediction.createdAt,
        updatedAt: result.prediction.updatedAt || undefined,
      };
      onSave?.(predictionForCallback);
      setTimeout(() => {
        onOpenChange(false);
      }, 1000);
    } else {
      setError(result.error || "Erro ao salvar o chute.");
    }
  };

  const handleDelete = async () => {
    if (!userId) return;

    const result = await dbDeletePrediction(match.id, match.date);
    if (result.success) {
      setExistingPrediction(null);
      setHomeScore(0);
      setAwayScore(0);
      setFirstToScore("home");
    } else {
      setError(result.error || "Erro ao remover o chute.");
    }
  };

  const incrementScore = (team: "home" | "away") => {
    if (isLocked) return;
    if (team === "home") {
      setHomeScore((s) => Math.min(s + 1, 15));
    } else {
      setAwayScore((s) => Math.min(s + 1, 15));
    }
  };

  const decrementScore = (team: "home" | "away") => {
    if (isLocked) return;
    if (team === "home") {
      setHomeScore((s) => Math.max(s - 1, 0));
    } else {
      setAwayScore((s) => Math.max(s - 1, 0));
    }
  };

  const noGoals = homeScore === 0 && awayScore === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <VisuallyHidden.Root>
          <DialogTitle>Fazer Chute</DialogTitle>
        </VisuallyHidden.Root>
        <div className="space-y-6">
          {/* Match Info */}
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground capitalize">
              {formatDateWithTime(match.date)}
            </p>
            <p className="text-xs text-muted-foreground">{match.venue}</p>
          </div>

          {/* Deadline Badge */}
          <div className="flex justify-center">
            <div
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm",
                isLocked
                  ? "bg-destructive/10 text-destructive"
                  : "bg-primary/10 text-primary"
              )}
            >
              <Clock weight="bold" className="w-4 h-4" />
              {isLocked ? "Chutes encerrados" : `Faltam ${deadline.formatted}`}
            </div>
          </div>

          {/* Score Inputs */}
          <div className="flex items-center justify-center gap-4">
            {/* Home Team */}
            <div className="flex flex-col items-center gap-2">
              <TeamFlag
                flag={match.homeTeam.flag}
                name={match.homeTeam.name}
                size="lg"
              />
              <span className="text-sm font-medium">{match.homeTeam.code}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => decrementScore("home")}
                  disabled={homeScore === 0 || isLocked}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-3xl font-bold w-10 text-center">
                  {homeScore}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => incrementScore("home")}
                  disabled={isLocked}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* VS */}
            <div className="text-2xl font-bold text-muted-foreground">×</div>

            {/* Away Team */}
            <div className="flex flex-col items-center gap-2">
              <TeamFlag
                flag={match.awayTeam.flag}
                name={match.awayTeam.name}
                size="lg"
              />
              <span className="text-sm font-medium">{match.awayTeam.code}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => decrementScore("away")}
                  disabled={awayScore === 0 || isLocked}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-3xl font-bold w-10 text-center">
                  {awayScore}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => incrementScore("away")}
                  disabled={isLocked}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* First to Score */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-center">Primeiro a marcar</p>
            <div className="flex justify-center gap-3">
              <Button
                variant={firstToScore === "home" ? "default" : "outline"}
                className={cn(
                  "rounded-full h-10 px-5",
                  firstToScore !== "home" && "!border-white/40 hover:!border-white/70"
                )}
                onClick={() => !isLocked && setFirstToScore("home")}
                disabled={isLocked || noGoals}
              >
                {match.homeTeam.code}
              </Button>
              <Button
                variant={firstToScore === "away" ? "default" : "outline"}
                className={cn(
                  "rounded-full h-10 px-5",
                  firstToScore !== "away" && "!border-white/40 hover:!border-white/70"
                )}
                onClick={() => !isLocked && setFirstToScore("away")}
                disabled={isLocked || noGoals}
              >
                {match.awayTeam.code}
              </Button>
            </div>
          </div>

          {/* Scoring Rules */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-center">Regras de pontuação:</p>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="text-center space-y-2">
                <p className="font-medium">Placar exato</p>
                <div className="space-y-3">
                  <div className="bg-muted rounded-lg px-2 py-1">
                    <p className="text-muted-foreground">Acerto único:</p>
                    <p className="font-bold">{POINTS.EXACT_SCORE.unique}pts</p>
                  </div>
                  <div className="bg-muted rounded-lg px-2 py-1">
                    <p className="text-muted-foreground">Compartilhado:</p>
                    <p className="font-bold">{POINTS.EXACT_SCORE.shared}pts</p>
                  </div>
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="font-medium">Resultado</p>
                <div className="space-y-3">
                  <div className="bg-muted rounded-lg px-2 py-1">
                    <p className="text-muted-foreground">Acerto único:</p>
                    <p className="font-bold">{POINTS.RESULT.unique}pts</p>
                  </div>
                  <div className="bg-muted rounded-lg px-2 py-1">
                    <p className="text-muted-foreground">Compartilhado:</p>
                    <p className="font-bold">{POINTS.RESULT.shared}pts</p>
                  </div>
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="font-medium">1º a marcar</p>
                <div className="space-y-3">
                  <div className="bg-muted rounded-lg px-2 py-1">
                    <p className="text-muted-foreground">Acerto único:</p>
                    <p className="font-bold">{POINTS.FIRST_SCORER.unique}pts</p>
                  </div>
                  <div className="bg-muted rounded-lg px-2 py-1">
                    <p className="text-muted-foreground">Compartilhado:</p>
                    <p className="font-bold">{POINTS.FIRST_SCORER.shared}pt</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm justify-center">
              <X weight="bold" className="w-4 h-4" />
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-green-600 text-sm justify-center">
              <Check weight="bold" className="w-4 h-4" />
              Chute salvo com sucesso!
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {existingPrediction && !isLocked && (
              <Button
                variant="outline"
                className="flex-1 h-12 text-base rounded-full"
                onClick={handleDelete}
                disabled={saving}
              >
                Remover
              </Button>
            )}
            <Button
              className="flex-1 h-12 text-base rounded-full"
              onClick={handleSave}
              disabled={isLocked || saving || success}
            >
              {saving ? "Salvando..." : "Fazer Chute"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
