"use client";

import type { Challenge, ChallengeWinner } from "@/types";

const STORAGE_KEY = "bolao-copa26-challenges";

export const CHALLENGE_POINTS = {
  WIN: 3,
  TIE: 1,
  BOTH_ZERO: -1,
} as const;

function generateId(): string {
  return `chal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function getAllChallenges(): Challenge[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const challenges = JSON.parse(stored) as Challenge[];
    return challenges.map((c) => ({
      ...c,
      createdAt: new Date(c.createdAt),
      acceptedAt: c.acceptedAt ? new Date(c.acceptedAt) : undefined,
      completedAt: c.completedAt ? new Date(c.completedAt) : undefined,
    }));
  } catch {
    return [];
  }
}

function saveAllChallenges(challenges: Challenge[]): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(challenges));
  } catch (error) {
    console.error("Failed to save challenges:", error);
  }
}

export interface CreateChallengeInput {
  matchId: string;
  challengerId: string;
  challengerName: string;
  challengedId: string;
  challengedName: string;
}

export function createChallenge(
  input: CreateChallengeInput
): { success: boolean; error?: string; challenge?: Challenge } {
  const challenges = getAllChallenges();

  const existing = challenges.find(
    (c) =>
      c.matchId === input.matchId &&
      c.challengerId === input.challengerId &&
      c.challengedId === input.challengedId &&
      c.status !== "declined"
  );

  if (existing) {
    return {
      success: false,
      error: "Você já desafiou este amigo neste jogo.",
    };
  }

  const newChallenge: Challenge = {
    id: generateId(),
    matchId: input.matchId,
    challengerId: input.challengerId,
    challengerName: input.challengerName,
    challengedId: input.challengedId,
    challengedName: input.challengedName,
    status: "pending",
    createdAt: new Date(),
  };

  challenges.push(newChallenge);
  saveAllChallenges(challenges);

  return { success: true, challenge: newChallenge };
}

export function acceptChallenge(
  challengeId: string,
  userId: string
): { success: boolean; error?: string } {
  const challenges = getAllChallenges();
  const index = challenges.findIndex((c) => c.id === challengeId);

  if (index < 0) {
    return { success: false, error: "Desafio não encontrado." };
  }

  const challenge = challenges[index];

  if (challenge.challengedId !== userId) {
    return { success: false, error: "Você não pode aceitar este desafio." };
  }

  if (challenge.status !== "pending") {
    return { success: false, error: "Este desafio já foi respondido." };
  }

  challenges[index] = {
    ...challenge,
    status: "accepted",
    acceptedAt: new Date(),
  };

  saveAllChallenges(challenges);
  return { success: true };
}

export function declineChallenge(
  challengeId: string,
  userId: string
): { success: boolean; error?: string } {
  const challenges = getAllChallenges();
  const index = challenges.findIndex((c) => c.id === challengeId);

  if (index < 0) {
    return { success: false, error: "Desafio não encontrado." };
  }

  const challenge = challenges[index];

  if (challenge.challengedId !== userId) {
    return { success: false, error: "Você não pode recusar este desafio." };
  }

  if (challenge.status !== "pending") {
    return { success: false, error: "Este desafio já foi respondido." };
  }

  challenges[index] = {
    ...challenge,
    status: "declined",
  };

  saveAllChallenges(challenges);
  return { success: true };
}

export function getChallengesByUser(userId: string): {
  sent: Challenge[];
  received: Challenge[];
  active: Challenge[];
  completed: Challenge[];
} {
  const challenges = getAllChallenges();

  const sent = challenges.filter((c) => c.challengerId === userId);
  const received = challenges.filter((c) => c.challengedId === userId);

  const active = challenges.filter(
    (c) =>
      (c.challengerId === userId || c.challengedId === userId) &&
      (c.status === "pending" || c.status === "accepted")
  );

  const completed = challenges.filter(
    (c) =>
      (c.challengerId === userId || c.challengedId === userId) &&
      c.status === "completed"
  );

  return { sent, received, active, completed };
}

export function getPendingChallengesForUser(userId: string): Challenge[] {
  const challenges = getAllChallenges();
  return challenges.filter(
    (c) => c.challengedId === userId && c.status === "pending"
  );
}

export function getActiveChallengesForMatch(
  matchId: string,
  userId: string
): Challenge[] {
  const challenges = getAllChallenges();
  return challenges.filter(
    (c) =>
      c.matchId === matchId &&
      (c.challengerId === userId || c.challengedId === userId) &&
      (c.status === "pending" || c.status === "accepted")
  );
}

export function completeChallenge(
  challengeId: string,
  challengerTotalPoints: number,
  challengedTotalPoints: number
): { success: boolean; error?: string } {
  const challenges = getAllChallenges();
  const index = challenges.findIndex((c) => c.id === challengeId);

  if (index < 0) {
    return { success: false, error: "Desafio não encontrado." };
  }

  const challenge = challenges[index];

  if (challenge.status !== "accepted") {
    return { success: false, error: "Este desafio não está ativo." };
  }

  let winner: ChallengeWinner;
  let challengerBonusPoints = 0;
  let challengedBonusPoints = 0;

  if (challengerTotalPoints > challengedTotalPoints) {
    winner = "challenger";
    challengerBonusPoints = CHALLENGE_POINTS.WIN;
  } else if (challengedTotalPoints > challengerTotalPoints) {
    winner = "challenged";
    challengedBonusPoints = CHALLENGE_POINTS.WIN;
  } else if (challengerTotalPoints === 0 && challengedTotalPoints === 0) {
    winner = "tie";
    challengerBonusPoints = CHALLENGE_POINTS.BOTH_ZERO;
    challengedBonusPoints = CHALLENGE_POINTS.BOTH_ZERO;
  } else {
    winner = "tie";
    challengerBonusPoints = CHALLENGE_POINTS.TIE;
    challengedBonusPoints = CHALLENGE_POINTS.TIE;
  }

  challenges[index] = {
    ...challenge,
    status: "completed",
    completedAt: new Date(),
    result: {
      challengerPoints: challengerBonusPoints,
      challengedPoints: challengedBonusPoints,
      winner,
    },
  };

  saveAllChallenges(challenges);
  return { success: true };
}

export function voidChallenge(challengeId: string): { success: boolean; error?: string } {
  const challenges = getAllChallenges();
  const index = challenges.findIndex((c) => c.id === challengeId);

  if (index < 0) {
    return { success: false, error: "Desafio não encontrado." };
  }

  challenges[index] = {
    ...challenges[index],
    status: "completed",
    completedAt: new Date(),
    result: {
      challengerPoints: 0,
      challengedPoints: 0,
      winner: "void",
    },
  };

  saveAllChallenges(challenges);
  return { success: true };
}

export function getChallengeStats(userId: string): {
  totalChallenges: number;
  wins: number;
  losses: number;
  ties: number;
  pointsFromChallenges: number;
} {
  const { completed } = getChallengesByUser(userId);

  let wins = 0;
  let losses = 0;
  let ties = 0;
  let pointsFromChallenges = 0;

  completed.forEach((c) => {
    if (!c.result || c.result.winner === "void") return;

    const isChallenger = c.challengerId === userId;
    const myPoints = isChallenger
      ? c.result.challengerPoints
      : c.result.challengedPoints;

    pointsFromChallenges += myPoints;

    if (c.result.winner === "tie") {
      ties++;
    } else if (
      (c.result.winner === "challenger" && isChallenger) ||
      (c.result.winner === "challenged" && !isChallenger)
    ) {
      wins++;
    } else {
      losses++;
    }
  });

  return {
    totalChallenges: completed.length,
    wins,
    losses,
    ties,
    pointsFromChallenges,
  };
}

export function clearAllChallenges(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
