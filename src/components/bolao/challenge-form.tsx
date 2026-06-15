"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Fire,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  FlagBanner,
  ArrowLeft,
} from "@phosphor-icons/react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "radix-ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Match } from "@/types";
import { createChallenge } from "@/lib/db/challenges";
import { getPrediction } from "@/lib/db/predictions";
import {
  getAllFriendsWithLeagues,
  getCommonLeagues,
  type FriendWithLeagues,
} from "@/lib/db/leagues";
import { isPredictionDeadlinePassed } from "@/lib/scoring";
import { PredictionForm } from "./prediction-form";
import { TeamFlag } from "./team-flag";

type Step = "friend" | "match" | "confirm";

interface ChallengeFormPropsWithMatch {
  match: Match;
  matches?: never;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface ChallengeFormPropsWithMatches {
  match?: never;
  matches: Match[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type ChallengeFormProps = ChallengeFormPropsWithMatch | ChallengeFormPropsWithMatches;

export function ChallengeForm({
  match: singleMatch,
  matches,
  open,
  onOpenChange,
  onSuccess,
}: ChallengeFormProps) {
  const { userId } = useAuth();
  const [step, setStep] = useState<Step>("friend");
  const [selectedFriend, setSelectedFriend] = useState<FriendWithLeagues | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [commonLeagues, setCommonLeagues] = useState<Array<{ id: string; name: string }>>([]);
  const [userHasPrediction, setUserHasPrediction] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingPrediction, setCheckingPrediction] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPredictionForm, setShowPredictionForm] = useState(false);
  const [friends, setFriends] = useState<FriendWithLeagues[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isStandaloneMode = !singleMatch && matches !== undefined;

  const availableMatches = useMemo(() => {
    if (!isStandaloneMode || !matches) return [];
    return matches.filter((m) => !isPredictionDeadlinePassed(m.date));
  }, [isStandaloneMode, matches]);

  const currentMatch = useMemo(() => {
    if (singleMatch) return singleMatch;
    return selectedMatch;
  }, [singleMatch, selectedMatch]);

  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return friends;
    const query = searchQuery.toLowerCase();
    return friends.filter((friend) =>
      friend.userName.toLowerCase().includes(query)
    );
  }, [friends, searchQuery]);

  useEffect(() => {
    if (open && userId) {
      loadFriends();
    }
  }, [open, userId]);

  useEffect(() => {
    if (open) {
      setStep("friend");
      setSelectedFriend(null);
      setSelectedMatch(singleMatch || null);
      setCommonLeagues([]);
      setError(null);
      setSuccess(false);
      setUserHasPrediction(false);
      setSearchQuery("");
    }
  }, [open, singleMatch]);

  useEffect(() => {
    if (!open || !userId || !currentMatch) return;

    setCheckingPrediction(true);
    getPrediction(currentMatch.id, userId).then((prediction) => {
      setUserHasPrediction(prediction !== null);
      setCheckingPrediction(false);
    });
  }, [open, userId, currentMatch?.id]);

  const loadFriends = async () => {
    if (!userId) return;
    setLoadingFriends(true);
    const allFriends = await getAllFriendsWithLeagues(userId);
    setFriends(allFriends);
    setLoadingFriends(false);
  };

  const handleSelectFriend = async (friend: FriendWithLeagues) => {
    setSelectedFriend(friend);
    setError(null);

    if (!userId) return;

    const leagues = await getCommonLeagues(userId, friend.userId);
    setCommonLeagues(leagues);

    if (leagues.length === 0) {
      setError("Vocês não participam de nenhuma liga em comum.");
      return;
    }

    if (singleMatch) {
      setStep("confirm");
    } else {
      setStep("match");
    }
  };

  const handleSelectMatch = (match: Match) => {
    setSelectedMatch(match);
    setStep("confirm");
  };

  const handleBack = () => {
    if (step === "confirm") {
      if (isStandaloneMode) {
        setStep("match");
      } else {
        setStep("friend");
      }
    } else if (step === "match") {
      setStep("friend");
    }
    setError(null);
  };

  const handleCreateChallenge = async () => {
    if (!userId || !selectedFriend || !currentMatch) return;

    if (!userHasPrediction) {
      setShowPredictionForm(true);
      return;
    }

    await sendChallenge();
  };

  const sendChallenge = async () => {
    if (!userId || !selectedFriend || !currentMatch || commonLeagues.length === 0) return;

    setLoading(true);
    setError(null);

    const result = await createChallenge({
      matchId: currentMatch.id,
      challengedId: selectedFriend.userId,
      challengedName: selectedFriend.userName,
      leagueIds: commonLeagues.map((l) => l.id),
    });

    setLoading(false);

    if (result.success) {
      setSuccess(true);
      onSuccess?.();
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } else {
      setError(result.error || "Erro ao criar desafio.");
    }
  };

  const handlePredictionSaved = () => {
    setShowPredictionForm(false);
    setUserHasPrediction(true);
    sendChallenge();
  };

  if (showPredictionForm && currentMatch) {
    return (
      <PredictionForm
        match={currentMatch}
        open={showPredictionForm}
        onOpenChange={(isOpen) => {
          setShowPredictionForm(isOpen);
          if (!isOpen) {
            onOpenChange(false);
          }
        }}
        onSave={handlePredictionSaved}
      />
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <VisuallyHidden.Root>
          <DialogTitle>Criar Desafio</DialogTitle>
        </VisuallyHidden.Root>

        <div className="space-y-6 pt-4 overflow-y-auto">
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="w-12 h-12 mx-auto rounded-full bg-orange-500/10 flex items-center justify-center mb-3">
              <Fire size={24} weight="bold" className="text-orange-500" />
            </div>
            <p className="text-xl font-medium">
              {step === "friend" && "Escolha um amigo"}
              {step === "match" && "Escolha o jogo"}
              {step === "confirm" && "Confirmar desafio"}
            </p>
            {step === "friend" && (
              <p className="text-sm text-muted-foreground">
                Amigos de todas as suas ligas
              </p>
            )}
          </div>

          {/* Step 1: Friend Selection */}
          {step === "friend" && (
            <div className="space-y-3">
              {friends.length > 5 && (
                <input
                  type="text"
                  placeholder="Buscar por nome..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 bg-muted rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              )}
              <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                {loadingFriends ? (
                  <div className="text-center py-8">
                    <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Carregando amigos...</p>
                  </div>
                ) : filteredFriends.length === 0 ? (
                  <div className="text-center py-8">
                    <Users size={32} className="mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {friends.length === 0
                        ? "Você ainda não tem amigos em suas ligas"
                        : "Nenhum amigo encontrado"}
                    </p>
                  </div>
                ) : (
                  filteredFriends.map((friend) => (
                    <button
                      key={friend.userId}
                      onClick={() => handleSelectFriend(friend)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl transition-colors",
                        "bg-muted hover:bg-muted/80"
                      )}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                        {friend.userAvatarUrl ? (
                          <img
                            src={friend.userAvatarUrl}
                            alt={friend.userName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium">
                            {friend.userName.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="font-medium">{friend.userName}</p>
                        <div className="flex items-center gap-1 flex-wrap">
                          {friend.leagues.slice(0, 2).map((league) => (
                            <span
                              key={league.id}
                              className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                            >
                              {league.name}
                            </span>
                          ))}
                          {friend.leagues.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{friend.leagues.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Step 2: Match Selection (standalone mode) */}
          {step === "match" && (
            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {availableMatches.length > 0 ? (
                availableMatches.map((match) => (
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
                        <span className="text-sm font-medium">{match.homeTeam.code}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">vs</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{match.awayTeam.code}</span>
                        <TeamFlag
                          flag={match.awayTeam.flag}
                          name={match.awayTeam.name}
                          size="sm"
                        />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Intl.DateTimeFormat("pt-BR", {
                        day: "2-digit",
                        month: "short",
                      }).format(match.date)}
                    </span>
                  </button>
                ))
              ) : (
                <div className="text-center py-8">
                  <Clock size={32} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum jogo disponível no momento
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === "confirm" && selectedFriend && currentMatch && (
            <div className="space-y-4">
              {/* Friend */}
              <div className="bg-muted rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-2">Desafiando</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                    {selectedFriend.userAvatarUrl ? (
                      <img
                        src={selectedFriend.userAvatarUrl}
                        alt={selectedFriend.userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-medium">
                        {selectedFriend.userName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">{selectedFriend.userName}</p>
                  </div>
                </div>
              </div>

              {/* Match */}
              <div className="bg-muted rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-2">Jogo</p>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2">
                    <TeamFlag
                      flag={currentMatch.homeTeam.flag}
                      name={currentMatch.homeTeam.name}
                      size="md"
                    />
                    <span className="font-medium">{currentMatch.homeTeam.code}</span>
                  </div>
                  <span className="text-muted-foreground">vs</span>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{currentMatch.awayTeam.code}</span>
                    <TeamFlag
                      flag={currentMatch.awayTeam.flag}
                      name={currentMatch.awayTeam.name}
                      size="md"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  {new Intl.DateTimeFormat("pt-BR", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(currentMatch.date)}
                </p>
              </div>

              {/* Leagues */}
              <div className="bg-muted rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-2">
                  Registrado em {commonLeagues.length} liga{commonLeagues.length > 1 ? "s" : ""}
                </p>
                <div className="flex flex-wrap gap-2">
                  {commonLeagues.map((league) => (
                    <span
                      key={league.id}
                      className="inline-flex items-center gap-1 text-sm bg-primary/10 text-primary px-3 py-1 rounded-full"
                    >
                      <FlagBanner size={14} weight="bold" />
                      {league.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Warning if no prediction */}
              {!userHasPrediction && !checkingPrediction && (
                <div className="flex items-center gap-2 justify-center text-yellow-500 text-sm bg-yellow-500/10 rounded-lg px-4 py-2">
                  <Clock weight="bold" className="w-4 h-4" />
                  <span>Você precisa fazer um chute antes de desafiar.</span>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm justify-center bg-destructive/10 rounded-lg px-4 py-2">
              <XCircle weight="bold" className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 text-green-500 text-sm justify-center bg-green-500/10 rounded-lg px-4 py-2">
              <CheckCircle weight="bold" className="w-4 h-4" />
              Desafio enviado!
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            {step === "confirm" && (
              <Button
                className="w-full h-12 text-base rounded-full"
                onClick={handleCreateChallenge}
                disabled={loading || success || checkingPrediction}
              >
                {loading ? (
                  "Enviando..."
                ) : success ? (
                  "Enviado!"
                ) : !userHasPrediction ? (
                  <>
                    <Fire className="w-5 h-5 mr-2" />
                    Fazer Chute e Desafiar
                  </>
                ) : (
                  <>
                    <Fire className="w-5 h-5 mr-2" />
                    Enviar Desafio
                  </>
                )}
              </Button>
            )}

            {(step === "match" || step === "confirm") && (
              <button
                onClick={handleBack}
                disabled={loading || success}
                className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
              >
                <ArrowLeft size={16} />
                Voltar
              </button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
