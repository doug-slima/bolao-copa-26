"use client";

import type { Prediction, FirstToScore } from "@/types";
import { isPredictionDeadlinePassed } from "./scoring";

const STORAGE_KEY = "bolao-copa26-predictions";

export interface PredictionInput {
  matchId: string;
  userId: string;
  homeScore: number;
  awayScore: number;
  firstToScore: FirstToScore;
}

function generateId(): string {
  return `pred_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function getAllPredictions(): Prediction[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const predictions = JSON.parse(stored) as Prediction[];
    return predictions.map((p) => ({
      ...p,
      createdAt: new Date(p.createdAt),
      updatedAt: p.updatedAt ? new Date(p.updatedAt) : undefined,
      lockedAt: p.lockedAt ? new Date(p.lockedAt) : undefined,
    }));
  } catch {
    return [];
  }
}

function saveAllPredictions(predictions: Prediction[]): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(predictions));
  } catch (error) {
    console.error("Failed to save predictions:", error);
  }
}

export function savePrediction(
  input: PredictionInput,
  matchDate: Date
): { success: boolean; error?: string; prediction?: Prediction } {
  if (isPredictionDeadlinePassed(matchDate)) {
    return { success: false, error: "O prazo para chutes neste jogo já encerrou." };
  }

  const predictions = getAllPredictions();
  const existingIndex = predictions.findIndex(
    (p) => p.matchId === input.matchId && p.userId === input.userId
  );

  const now = new Date();
  
  if (existingIndex >= 0) {
    const existing = predictions[existingIndex];
    if (existing.lockedAt) {
      return { success: false, error: "Este chute já foi travado e não pode ser editado." };
    }
    
    const updatedPrediction: Prediction = {
      ...existing,
      homeScore: input.homeScore,
      awayScore: input.awayScore,
      firstToScore: input.firstToScore,
      updatedAt: now,
    };
    
    predictions[existingIndex] = updatedPrediction;
    saveAllPredictions(predictions);
    
    return { success: true, prediction: updatedPrediction };
  }

  const newPrediction: Prediction = {
    id: generateId(),
    matchId: input.matchId,
    userId: input.userId,
    homeScore: input.homeScore,
    awayScore: input.awayScore,
    firstToScore: input.firstToScore,
    createdAt: now,
  };

  predictions.push(newPrediction);
  saveAllPredictions(predictions);

  return { success: true, prediction: newPrediction };
}

export function getPrediction(matchId: string, userId: string): Prediction | null {
  const predictions = getAllPredictions();
  return predictions.find((p) => p.matchId === matchId && p.userId === userId) || null;
}

export function getUserPredictions(userId: string): Prediction[] {
  const predictions = getAllPredictions();
  return predictions.filter((p) => p.userId === userId);
}

export function getMatchPredictions(matchId: string): Prediction[] {
  const predictions = getAllPredictions();
  return predictions.filter((p) => p.matchId === matchId);
}

export function deletePrediction(
  matchId: string,
  userId: string,
  matchDate: Date
): { success: boolean; error?: string } {
  if (isPredictionDeadlinePassed(matchDate)) {
    return { success: false, error: "O prazo para modificar chutes neste jogo já encerrou." };
  }

  const predictions = getAllPredictions();
  const existingIndex = predictions.findIndex(
    (p) => p.matchId === matchId && p.userId === userId
  );

  if (existingIndex < 0) {
    return { success: false, error: "Chute não encontrado." };
  }

  const existing = predictions[existingIndex];
  if (existing.lockedAt) {
    return { success: false, error: "Este chute já foi travado e não pode ser removido." };
  }

  predictions.splice(existingIndex, 1);
  saveAllPredictions(predictions);

  return { success: true };
}

export function lockPrediction(matchId: string, userId: string): boolean {
  const predictions = getAllPredictions();
  const existingIndex = predictions.findIndex(
    (p) => p.matchId === matchId && p.userId === userId
  );

  if (existingIndex < 0) return false;

  predictions[existingIndex] = {
    ...predictions[existingIndex],
    lockedAt: new Date(),
  };
  
  saveAllPredictions(predictions);
  return true;
}

export function clearAllPredictions(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getUserStats(userId: string): {
  total: number;
  pending: number;
  locked: number;
} {
  const predictions = getUserPredictions(userId);
  const locked = predictions.filter((p) => p.lockedAt).length;
  
  return {
    total: predictions.length,
    pending: predictions.length - locked,
    locked,
  };
}

export function hasPrediction(matchId: string, userId: string): boolean {
  return getPrediction(matchId, userId) !== null;
}
