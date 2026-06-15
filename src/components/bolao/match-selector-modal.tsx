"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { Clock, Check, SneakerMove } from "@phosphor-icons/react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "radix-ui";
import { TeamFlag } from "./team-flag";
import { PredictionForm } from "./prediction-form";
import { cn } from "@/lib/utils";
import type { Match, Prediction } from "@/types";
import { getPrediction } from "@/lib/db/predictions";
import { isPredictionDeadlinePassed, getTimeUntilDeadline } from "@/lib/scoring";

interface MatchSelectorModalProps {
  matches: Match[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMatch?: (match: Match) => void;
  title?: string;
}

interface MatchWithPrediction {
  match: Match;
  hasPrediction: boolean;
}

export function MatchSelectorModal({
  matches,
  open,
  onOpenChange,
  onSelectMatch: onSelectMatchProp,
  title,
}: MatchSelectorModalProps) {
  const { userId } = useAuth();
  const [matchesWithPredictions, setMatchesWithPredictions] = useState<MatchWithPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [predictionFormOpen, setPredictionFormOpen] = useState(false);

  const availableMatches = useMemo(() => {
    return matches.filter((m) => !isPredictionDeadlinePassed(m.date));
  }, [matches]);

  useEffect(() => {
    if (open && userId) {
      loadPredictions();
    }
  }, [open, userId, availableMatches]);

  const loadPredictions = async () => {
    if (!userId) return;
    setLoading(true);

    const results = await Promise.all(
      availableMatches.map(async (match) => {
        const prediction = await getPrediction(match.id, userId);
        return {
          match,
          hasPrediction: prediction !== null,
        };
      })
    );

    setMatchesWithPredictions(results);
    setLoading(false);
  };

  const handleSelectMatch = (match: Match) => {
    if (onSelectMatchProp) {
      onSelectMatchProp(match);
      return;
    }
    setSelectedMatch(match);
    setPredictionFormOpen(true);
  };

  const handlePredictionSaved = (prediction: Prediction) => {
    setMatchesWithPredictions((prev) =>
      prev.map((m) =>
        m.match.id === prediction.matchId ? { ...m, hasPrediction: true } : m
      )
    );
    setPredictionFormOpen(false);
    setSelectedMatch(null);
  };

  const handlePredictionFormClose = (isOpen: boolean) => {
    setPredictionFormOpen(isOpen);
    if (!isOpen) {
      setSelectedMatch(null);
    }
  };

  const formatMatchDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <>
      <Dialog open={open && !predictionFormOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <VisuallyHidden.Root>
            <DialogTitle>Escolher Jogo</DialogTitle>
          </VisuallyHidden.Root>

          <div className="space-y-4">
            <div className="text-center space-y-1 pt-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <SneakerMove size={24} weight="bold" className="text-primary" />
              </div>
              <h2 className="text-xl font-semibold">{title || "Fazer um Chute"}</h2>
              <p className="text-sm text-muted-foreground">
                Escolha um jogo {onSelectMatchProp ? "" : "para fazer seu chute"}
              </p>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-pulse text-muted-foreground">
                    Carregando jogos...
                  </div>
                </div>
              ) : matchesWithPredictions.length > 0 ? (
                matchesWithPredictions.map(({ match, hasPrediction }) => {
                  const deadline = getTimeUntilDeadline(match.date);
                  
                  return (
                    <button
                      key={match.id}
                      onClick={() => handleSelectMatch(match)}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-xl transition-colors",
                        "bg-muted hover:bg-muted/80"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <TeamFlag
                            flag={match.homeTeam.flag}
                            name={match.homeTeam.name}
                            size="sm"
                          />
                          <span className="text-sm font-medium">
                            {match.homeTeam.code}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">vs</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {match.awayTeam.code}
                          </span>
                          <TeamFlag
                            flag={match.awayTeam.flag}
                            name={match.awayTeam.name}
                            size="sm"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {hasPrediction ? (
                          <span className="flex items-center gap-1 text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-lg">
                            <Check size={12} weight="bold" />
                            Feito
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock size={12} weight="bold" />
                            {deadline.formatted}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <Clock size={32} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum jogo disponível no momento
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Aguarde os próximos jogos serem liberados
                  </p>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedMatch && (
        <PredictionForm
          match={selectedMatch}
          open={predictionFormOpen}
          onOpenChange={handlePredictionFormClose}
          onSave={handlePredictionSaved}
        />
      )}
    </>
  );
}
