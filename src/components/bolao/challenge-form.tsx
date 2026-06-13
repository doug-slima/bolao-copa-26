"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { Fire, CheckCircle, XCircle, Clock, Check, Users } from "@phosphor-icons/react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "radix-ui";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Match } from "@/types";
import { createChallenge } from "@/lib/db/challenges";
import { getPrediction } from "@/lib/db/predictions";
import { getLeagueMembers, getUserLeagues } from "@/lib/db/leagues";
import { isPredictionDeadlinePassed } from "@/lib/scoring";
import { PredictionForm } from "./prediction-form";
import { TeamFlag } from "./team-flag";

interface LeagueMember {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface ChallengeFormPropsWithMatch {
  match: Match;
  matches?: never;
  leagueId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface ChallengeFormPropsWithMatches {
  match?: never;
  matches: Match[];
  leagueId?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

type ChallengeFormProps = ChallengeFormPropsWithMatch | ChallengeFormPropsWithMatches;

export function ChallengeForm({
  match: singleMatch,
  matches,
  leagueId,
  open,
  onOpenChange,
  onSuccess,
}: ChallengeFormProps) {
  const { userId } = useAuth();
  const { user } = useUser();
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);
  const [userHasPrediction, setUserHasPrediction] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPredictionForm, setShowPredictionForm] = useState(false);
  const [leagueMembers, setLeagueMembers] = useState<LeagueMember[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  const isStandaloneMode = !singleMatch && matches !== undefined;
  
  const availableMatches = useMemo(() => {
    if (!isStandaloneMode || !matches) return [];
    return matches.filter((m) => !isPredictionDeadlinePassed(m.date));
  }, [isStandaloneMode, matches]);

  const currentMatch = useMemo(() => {
    if (singleMatch) return singleMatch;
    if (selectedMatchId && matches) {
      return matches.find((m) => m.id === selectedMatchId);
    }
    return undefined;
  }, [singleMatch, selectedMatchId, matches]);

  const isLocked = currentMatch ? isPredictionDeadlinePassed(currentMatch.date) : false;

  useEffect(() => {
    if (!open || !userId) return;

    const loadMembers = async () => {
      setLoadingMembers(true);
      try {
        let targetLeagueId = leagueId;
        
        if (!targetLeagueId) {
          const userLeagues = await getUserLeagues(userId);
          if (userLeagues.length > 0) {
            targetLeagueId = userLeagues[0].id;
          }
        }
        
        if (targetLeagueId) {
          const members = await getLeagueMembers(targetLeagueId);
          const otherMembers = members
            .filter((m) => m.userId !== userId)
            .map((m) => ({
              id: m.userId,
              name: m.userName,
              avatarUrl: m.userAvatarUrl,
            }));
          setLeagueMembers(otherMembers);
        }
      } finally {
        setLoadingMembers(false);
      }
    };

    loadMembers();
  }, [open, leagueId, userId]);

  useEffect(() => {
    if (open) {
      setSelectedFriends([]);
      setSelectedMatchId(singleMatch?.id || null);
      setError(null);
      setSuccess(false);
      setUserHasPrediction(false);
      setChecking(false);
    }
  }, [open, singleMatch?.id]);

  useEffect(() => {
    if (!open || !userId || !currentMatch) return;

    setChecking(true);
    getPrediction(currentMatch.id, userId).then((prediction) => {
      setUserHasPrediction(prediction !== null);
      setChecking(false);
    });
  }, [open, userId, currentMatch?.id]);

  const toggleFriend = (friendId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleCreateChallenge = async () => {
    if (!userId || selectedFriends.length === 0 || !currentMatch) return;

    if (!userHasPrediction) {
      setShowPredictionForm(true);
      return;
    }

    await sendChallenges();
  };

  const sendChallenges = async () => {
    if (!userId || selectedFriends.length === 0 || !currentMatch) return;

    setLoading(true);
    setError(null);

    let successCount = 0;
    let lastError: string | null = null;

    for (const friendId of selectedFriends) {
      const friendData = leagueMembers.find((f) => f.id === friendId);
      if (!friendData) continue;

      const result = await createChallenge({
        matchId: currentMatch.id,
        challengedId: friendId,
        challengedName: friendData.name,
      });

      if (result.success) {
        successCount++;
      } else {
        lastError = result.error || "Erro ao criar desafio.";
      }
    }

    setLoading(false);

    if (successCount > 0) {
      setSuccess(true);
      onSuccess?.();
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    } else if (lastError) {
      setError(lastError);
    }
  };

  const handlePredictionSaved = () => {
    setShowPredictionForm(false);
    setUserHasPrediction(true);
    sendChallenges();
  };

  if (showPredictionForm && currentMatch) {
    return (
      <PredictionForm
        match={currentMatch}
        open={showPredictionForm}
        onOpenChange={(open) => {
          setShowPredictionForm(open);
          if (!open) {
            onOpenChange(false);
          }
        }}
        onSave={handlePredictionSaved}
      />
    );
  }

  const showMatchSelector = isStandaloneMode && selectedFriends.length > 0;
  const canSubmit = selectedFriends.length > 0 && currentMatch;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <VisuallyHidden.Root>
          <DialogTitle>Criar Desafio</DialogTitle>
        </VisuallyHidden.Root>
        
        <div className="space-y-6 pt-6 overflow-y-auto">
          {/* Header */}
          <div className="text-center space-y-1">
            <div className="w-12 h-12 mx-auto rounded-full bg-orange-500/10 flex items-center justify-center mb-3">
              <Fire size={24} weight="bold" className="text-orange-500" />
            </div>
            <p className="text-xl font-medium">
              {showMatchSelector ? "Escolha o jogo" : "Escolha um amigo para desafiar"}
            </p>
          </div>

          {/* Step 1: Friend Selection */}
          {!showMatchSelector && (
            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {loadingMembers ? (
                <div className="text-center py-8">
                  <div className="w-8 h-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Carregando membros...</p>
                </div>
              ) : leagueMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users size={32} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum amigo na liga ainda.
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Convide amigos para participar!
                  </p>
                </div>
              ) : (
                leagueMembers.map((friend) => {
                  const isSelected = selectedFriends.includes(friend.id);
                  return (
                    <button
                      key={friend.id}
                      onClick={() => toggleFriend(friend.id)}
                      disabled={loading || success}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-xl transition-colors",
                        isSelected
                          ? "bg-foreground text-background"
                          : "bg-muted hover:bg-muted/80",
                        (loading || success) && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        {friend.avatarUrl ? (
                          <img
                            src={friend.avatarUrl}
                            alt={friend.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium",
                            isSelected ? "bg-background/20" : "bg-secondary"
                          )}>
                            {friend.name.charAt(0)}
                          </div>
                        )}
                        <span className="font-medium">{friend.name}</span>
                      </div>
                      {isSelected && (
                        <Check className="w-5 h-5" weight="bold" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          )}

          {/* Step 2: Match Selection (standalone mode only) */}
          {showMatchSelector && (
            <div className="space-y-2 max-h-[40vh] overflow-y-auto">
              {availableMatches.length > 0 ? (
                availableMatches.map((match) => (
                  <button
                    key={match.id}
                    onClick={() => setSelectedMatchId(match.id)}
                    disabled={loading || success}
                    className={cn(
                      "w-full flex items-center justify-between p-3 rounded-xl transition-colors",
                      selectedMatchId === match.id
                        ? "bg-foreground text-background"
                        : "bg-muted hover:bg-muted/80",
                      (loading || success) && "opacity-50 cursor-not-allowed"
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
                      <span className="text-xs opacity-70">vs</span>
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
                    <span className="text-xs opacity-70">
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

          {/* Warning if no prediction - only show after selecting match */}
          {canSubmit && !userHasPrediction && !checking && (
            <div className="flex items-center gap-2 justify-center text-yellow-500 text-sm bg-yellow-500/10 rounded-lg px-4 py-2">
              <Clock weight="bold" className="w-4 h-4" />
              <span>Você precisa fazer um chute antes de desafiar.</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm justify-center">
              <XCircle weight="bold" className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="flex items-center gap-2 text-green-500 text-sm justify-center">
              <CheckCircle weight="bold" className="w-4 h-4" />
              {selectedFriends.length > 1
                ? `${selectedFriends.length} desafios enviados!`
                : "Desafio enviado!"}
            </div>
          )}

          {/* Back button for match selection */}
          {showMatchSelector && (
            <button
              onClick={() => setSelectedMatchId(null)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Voltar para escolha de amigos
            </button>
          )}

          {/* Submit Button */}
          {canSubmit && (
            <Button
              className="w-full h-12 text-base rounded-full"
              onClick={handleCreateChallenge}
              disabled={loading || success || isLocked || checking}
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
                  {selectedFriends.length > 1
                    ? `Desafiar ${selectedFriends.length} amigos`
                    : "Enviar Desafio"}
                </>
              )}
            </Button>
          )}

          {/* Continue button to go to match selection (standalone mode) */}
          {isStandaloneMode && selectedFriends.length > 0 && !showMatchSelector && (
            <Button
              className="w-full h-12 text-base rounded-full"
              variant="outline"
              onClick={() => setSelectedMatchId("")}
            >
              Continuar para escolha do jogo
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
