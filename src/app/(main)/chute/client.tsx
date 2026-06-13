"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import {
  SneakerMove,
  Trophy,
  Target,
  Clock,
  CheckCircle,
} from "@phosphor-icons/react";
import { MatchCardWithPrediction } from "@/components/bolao/match-card-with-prediction";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Match, Prediction } from "@/types";
import { getUserPredictions } from "@/lib/predictions-store";
import { POINTS, getMaxPossiblePoints } from "@/lib/scoring";

type ViewMode = "rules" | "my-predictions" | "available";

interface ChutePageClientProps {
  matches: Match[];
}

export function ChutePageClient({ matches }: ChutePageClientProps) {
  const { isSignedIn, userId } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("available");
  const [userPredictions, setUserPredictions] = useState<Prediction[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && userId) {
      const predictions = getUserPredictions(userId);
      setUserPredictions(predictions);
    }
  }, [mounted, userId]);

  const predictionMap = useMemo(() => {
    const map = new Map<string, Prediction>();
    userPredictions.forEach((p) => map.set(p.matchId, p));
    return map;
  }, [userPredictions]);

  const availableMatches = useMemo(() => {
    return matches.filter((m) => !predictionMap.has(m.id));
  }, [matches, predictionMap]);

  const predictedMatches = useMemo(() => {
    return matches.filter((m) => predictionMap.has(m.id));
  }, [matches, predictionMap]);

  const stats = useMemo(() => {
    const total = matches.length;
    const done = predictedMatches.length;
    const pending = availableMatches.length;
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
      pending,
      maxPoints,
      totalPoints,
      exactScoreHits,
      resultHits,
      firstScorerHits,
    };
  }, [matches, predictedMatches, availableMatches, userPredictions]);

  const handlePredictionChange = () => {
    if (!userId) return;
    const predictions = getUserPredictions(userId);
    setUserPredictions(predictions);
  };

  if (!mounted) {
    return (
      <div className="space-y-10">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold">Chutes</h1>
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
        <h1 className="text-2xl font-bold">Chutes</h1>
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
            onClick={() => setViewMode("my-predictions")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full transition-all",
              viewMode === "my-predictions"
                ? "bg-foreground text-background"
                : "border border-white/40 text-muted-foreground hover:text-foreground hover:border-white/70"
            )}
          >
            Meus Chutes
          </button>
          <button
            onClick={() => setViewMode("available")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full transition-all",
              viewMode === "available"
                ? "bg-foreground text-background"
                : "border border-white/40 text-muted-foreground hover:text-foreground hover:border-white/70"
            )}
          >
            Fazer um Chute
          </button>
        </div>
      </div>

      {/* Auth Check for non-rules views */}
      {!isSignedIn && viewMode !== "rules" ? (
        <div className="bg-card rounded-2xl border border-border/50 p-6 text-center space-y-4">
          <SneakerMove className="w-12 h-12 mx-auto text-muted-foreground" />
          <div>
            <p className="font-medium">Faça login para chutar</p>
            <p className="text-sm text-muted-foreground">
              Você precisa estar logado para fazer seus palpites
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
                  Entenda como funcionam os chutes e a pontuação!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1 - O que você pode chutar */}
                <div className="bg-card rounded-2xl border border-border/50 p-5 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Target weight="bold" className="w-4 h-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm">O que você pode chutar</h3>
                  </div>
                  <ul className="text-muted-foreground text-xs space-y-2 list-disc list-inside flex-1">
                    <li>Placar do Jogo</li>
                    <li>Resultado Final do Jogo (vitória/empate)</li>
                    <li>Que time marca primeiro</li>
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
                    <li>Acertar o placar sozinho = <strong>{POINTS.EXACT_SCORE.unique} pts</strong></li>
                    <li>Acertar o placar com amigos = <strong>{POINTS.EXACT_SCORE.shared} pts</strong></li>
                    <li>Acertar o resultado sozinho = <strong>{POINTS.RESULT.unique} pts</strong></li>
                    <li>Acertar o resultado com amigos = <strong>{POINTS.RESULT.shared} pts</strong></li>
                    <li>Acertar 1º a marcar sozinho = <strong>{POINTS.FIRST_SCORER.unique} pts</strong></li>
                    <li>Acertar 1º a marcar com amigos = <strong>{POINTS.FIRST_SCORER.shared} pt</strong></li>
                  </ul>
                </div>

                {/* Card 3 - Prazo para chutar */}
                <div className="bg-card rounded-2xl border border-border/50 p-5 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                      <Clock weight="bold" className="w-4 h-4 text-orange-500" />
                    </div>
                    <h3 className="font-semibold text-sm">Prazo para chutar</h3>
                  </div>
                  <ul className="text-muted-foreground text-xs space-y-2 list-disc list-inside flex-1">
                    <li>Um chute por categoria (Placar; Resultado; 1º a Marcar)</li>
                    <li>Chutes até <strong>5 min antes</strong> do início do jogo</li>
                    <li>Edições até <strong>5 min antes</strong> do início do jogo</li>
                    <li>Após o prazo, não são aceitos novos chutes nem edições</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* My Predictions View */}
          {viewMode === "my-predictions" && (
            <div className="space-y-8">
              <div className="flex flex-col items-center gap-3">
                <p className="text-muted-foreground text-center">
                  Acompanhe seus chutes e estatísticas!
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card rounded-2xl border border-border/50 p-5">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Trophy weight="fill" className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm">Total de Pontos</span>
                  </div>
                  <p className="text-3xl font-bold">{stats.totalPoints}</p>
                </div>
                
                <div className="bg-card rounded-2xl border border-border/50 p-5">
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <Target weight="fill" className="w-5 h-5 text-primary" />
                    <span className="text-sm">Chutes Feitos</span>
                  </div>
                  <p className="text-3xl font-bold">
                    {stats.done}
                    <span className="text-lg font-normal text-muted-foreground">
                      /{stats.total}
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
                    <p className="text-2xl font-bold">{stats.exactScoreHits}</p>
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
                    <p className="text-2xl font-bold">{stats.resultHits}</p>
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
                    <p className="text-2xl font-bold">{stats.firstScorerHits}</p>
                  </div>
                </div>
              </div>

              {/* Points Potential */}
              <div className="bg-muted/50 rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Pontuação máxima possível com seus chutes atuais
                </p>
                <p className="text-2xl font-bold text-primary mt-1">
                  {stats.maxPoints} pts
                </p>
              </div>

              {/* Predictions List */}
              {predictedMatches.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="font-semibold">Seus Chutes</h3>
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
                <div className="text-center py-12 bg-card rounded-2xl border border-border/50">
                  <SneakerMove className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="font-medium">Nenhum chute ainda</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Você ainda não fez nenhum palpite
                  </p>
                  <Button onClick={() => setViewMode("available")}>
                    Fazer meu primeiro chute
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Available Matches View */}
          {viewMode === "available" && (
            <div className="space-y-8">
              <div className="flex flex-col items-center gap-3">
                <p className="text-muted-foreground text-center">
                  Escolha um jogo e faça seu chute!
                </p>
              </div>

              {availableMatches.length > 0 ? (
                <div className="flex flex-col gap-6">
                  {availableMatches.map((match) => (
                    <MatchCardWithPrediction
                      key={match.id}
                      match={match}
                      onPredictionChange={handlePredictionChange}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-card rounded-2xl border border-border/50">
                  <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-3" />
                  <p className="font-medium">Todos os chutes feitos!</p>
                  <p className="text-sm text-muted-foreground">
                    Você já chutou em todos os jogos disponíveis
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
