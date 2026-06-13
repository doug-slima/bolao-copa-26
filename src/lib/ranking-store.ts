"use client";

import type {
  UserRankingExtended,
  UserMetrics,
  League,
  LeagueRanking,
  MetricLeader,
  RankingMovement,
} from "@/types";

const mockUsers: UserRankingExtended[] = [
  {
    userId: "user_1",
    userName: "Carlos Silva",
    avatarUrl: undefined,
    totalPoints: 287,
    exactPredictions: 12,
    correctResults: 28,
    correctFirstScorers: 15,
    totalPredictions: 45,
    position: 1,
    movement: "up",
    positionChange: 2,
    challengeWins: 8,
    challengeLosses: 2,
    currentStreak: 5,
    uniqueExactPredictions: 4,
    closeCallMisses: 3,
  },
  {
    userId: "user_2",
    userName: "Ana Oliveira",
    avatarUrl: undefined,
    totalPoints: 265,
    exactPredictions: 10,
    correctResults: 30,
    correctFirstScorers: 12,
    totalPredictions: 48,
    position: 2,
    movement: "down",
    positionChange: 1,
    challengeWins: 6,
    challengeLosses: 4,
    currentStreak: 3,
    uniqueExactPredictions: 3,
    closeCallMisses: 5,
  },
  {
    userId: "user_3",
    userName: "Pedro Santos",
    avatarUrl: undefined,
    totalPoints: 248,
    exactPredictions: 9,
    correctResults: 26,
    correctFirstScorers: 14,
    totalPredictions: 42,
    position: 3,
    movement: "up",
    positionChange: 1,
    challengeWins: 7,
    challengeLosses: 3,
    currentStreak: 2,
    uniqueExactPredictions: 5,
    closeCallMisses: 2,
  },
  {
    userId: "user_4",
    userName: "Mariana Costa",
    avatarUrl: undefined,
    totalPoints: 231,
    exactPredictions: 8,
    correctResults: 24,
    correctFirstScorers: 11,
    totalPredictions: 40,
    position: 4,
    movement: "same",
    positionChange: 0,
    challengeWins: 5,
    challengeLosses: 5,
    currentStreak: 0,
    uniqueExactPredictions: 2,
    closeCallMisses: 7,
  },
  {
    userId: "user_5",
    userName: "Lucas Ferreira",
    avatarUrl: undefined,
    totalPoints: 218,
    exactPredictions: 7,
    correctResults: 25,
    correctFirstScorers: 10,
    totalPredictions: 44,
    position: 5,
    movement: "down",
    positionChange: 2,
    challengeWins: 4,
    challengeLosses: 6,
    currentStreak: 1,
    uniqueExactPredictions: 1,
    closeCallMisses: 4,
  },
  {
    userId: "user_6",
    userName: "Juliana Mendes",
    avatarUrl: undefined,
    totalPoints: 205,
    exactPredictions: 6,
    correctResults: 23,
    correctFirstScorers: 13,
    totalPredictions: 38,
    position: 6,
    movement: "up",
    positionChange: 3,
    challengeWins: 9,
    challengeLosses: 1,
    currentStreak: 7,
    uniqueExactPredictions: 2,
    closeCallMisses: 1,
  },
  {
    userId: "user_7",
    userName: "Rafael Almeida",
    avatarUrl: undefined,
    totalPoints: 192,
    exactPredictions: 5,
    correctResults: 22,
    correctFirstScorers: 9,
    totalPredictions: 41,
    position: 7,
    movement: "down",
    positionChange: 1,
    challengeWins: 3,
    challengeLosses: 7,
    currentStreak: 0,
    uniqueExactPredictions: 6,
    closeCallMisses: 8,
  },
  {
    userId: "user_8",
    userName: "Fernanda Lima",
    avatarUrl: undefined,
    totalPoints: 178,
    exactPredictions: 4,
    correctResults: 20,
    correctFirstScorers: 8,
    totalPredictions: 36,
    position: 8,
    movement: "same",
    positionChange: 0,
    challengeWins: 2,
    challengeLosses: 4,
    currentStreak: 2,
    uniqueExactPredictions: 1,
    closeCallMisses: 3,
  },
  {
    userId: "user_9",
    userName: "Bruno Rocha",
    avatarUrl: undefined,
    totalPoints: 165,
    exactPredictions: 3,
    correctResults: 19,
    correctFirstScorers: 7,
    totalPredictions: 35,
    position: 9,
    movement: "new",
    positionChange: 0,
    challengeWins: 1,
    challengeLosses: 2,
    currentStreak: 4,
    uniqueExactPredictions: 0,
    closeCallMisses: 6,
  },
  {
    userId: "user_10",
    userName: "Camila Souza",
    avatarUrl: undefined,
    totalPoints: 152,
    exactPredictions: 2,
    correctResults: 18,
    correctFirstScorers: 6,
    totalPredictions: 33,
    position: 10,
    movement: "down",
    positionChange: 3,
    challengeWins: 0,
    challengeLosses: 5,
    currentStreak: 0,
    uniqueExactPredictions: 0,
    closeCallMisses: 9,
  },
  {
    userId: "user_11",
    userName: "Diego Martins",
    avatarUrl: undefined,
    totalPoints: 140,
    exactPredictions: 2,
    correctResults: 16,
    correctFirstScorers: 5,
    totalPredictions: 30,
    position: 11,
    movement: "up",
    positionChange: 1,
    challengeWins: 3,
    challengeLosses: 3,
    currentStreak: 1,
    uniqueExactPredictions: 1,
    closeCallMisses: 2,
  },
  {
    userId: "user_12",
    userName: "Amanda Pereira",
    avatarUrl: undefined,
    totalPoints: 128,
    exactPredictions: 1,
    correctResults: 15,
    correctFirstScorers: 4,
    totalPredictions: 28,
    position: 12,
    movement: "down",
    positionChange: 2,
    challengeWins: 2,
    challengeLosses: 4,
    currentStreak: 0,
    uniqueExactPredictions: 0,
    closeCallMisses: 5,
  },
];

let mockLeagues: League[] = [
  {
    id: "league_1",
    name: "Amigos do Trabalho",
    description: "Bolão da galera do escritório",
    inviteCode: "WORK26",
    createdBy: "user_1",
    createdByName: "Carlos Silva",
    memberCount: 8,
    createdAt: new Date("2026-05-01"),
  },
  {
    id: "league_2",
    name: "Família Unida",
    description: "Bolão da família",
    inviteCode: "FAM123",
    createdBy: "user_4",
    createdByName: "Mariana Costa",
    memberCount: 6,
    createdAt: new Date("2026-05-15"),
  },
  {
    id: "league_3",
    name: "Pelada de Sábado",
    description: "Galera do futebol",
    inviteCode: "PLADA1",
    createdBy: "user_2",
    createdByName: "Ana Oliveira",
    memberCount: 10,
    createdAt: new Date("2026-04-20"),
  },
];

const leagueMembers: Record<string, string[]> = {
  league_1: ["user_1", "user_2", "user_3", "user_5", "user_6", "user_8", "user_9", "user_11"],
  league_2: ["user_1", "user_4", "user_7", "user_10", "user_11", "user_12"],
  league_3: ["user_2", "user_3", "user_4", "user_5", "user_6", "user_7", "user_8", "user_9", "user_10", "user_12"],
};

export function getGeneralRanking(): UserRankingExtended[] {
  return [...mockUsers].sort((a, b) => a.position - b.position);
}

export function getTopScorers(limit: number = 5): MetricLeader[] {
  return mockUsers
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, limit)
    .map((u) => ({
      userId: u.userId,
      userName: u.userName,
      avatarUrl: u.avatarUrl,
      value: u.totalPoints,
      label: `${u.totalPoints} pts`,
    }));
}

export function getTopVidentes(limit: number = 5): MetricLeader[] {
  return mockUsers
    .sort((a, b) => b.uniqueExactPredictions - a.uniqueExactPredictions)
    .slice(0, limit)
    .map((u) => ({
      userId: u.userId,
      userName: u.userName,
      avatarUrl: u.avatarUrl,
      value: u.uniqueExactPredictions,
      label: `${u.uniqueExactPredictions} únicos`,
    }));
}

export function getTopChallengers(limit: number = 5): MetricLeader[] {
  return mockUsers
    .sort((a, b) => b.challengeWins - a.challengeWins)
    .slice(0, limit)
    .map((u) => ({
      userId: u.userId,
      userName: u.userName,
      avatarUrl: u.avatarUrl,
      value: u.challengeWins,
      label: `${u.challengeWins} vitórias`,
    }));
}

export function getHotStreaks(limit: number = 5): MetricLeader[] {
  return mockUsers
    .filter((u) => u.currentStreak > 0)
    .sort((a, b) => b.currentStreak - a.currentStreak)
    .slice(0, limit)
    .map((u) => ({
      userId: u.userId,
      userName: u.userName,
      avatarUrl: u.avatarUrl,
      value: u.currentStreak,
      label: `${u.currentStreak} seguidos`,
    }));
}

export function getColdFeet(limit: number = 5): MetricLeader[] {
  return mockUsers
    .sort((a, b) => b.closeCallMisses - a.closeCallMisses)
    .slice(0, limit)
    .map((u) => ({
      userId: u.userId,
      userName: u.userName,
      avatarUrl: u.avatarUrl,
      value: u.closeCallMisses,
      label: `${u.closeCallMisses} quases`,
    }));
}

export function getUserLeagues(userId: string): League[] {
  return mockLeagues.filter((league) =>
    leagueMembers[league.id]?.includes(userId)
  );
}

export function getLeagueRanking(leagueId: string): LeagueRanking | null {
  const league = mockLeagues.find((l) => l.id === leagueId);
  if (!league) return null;

  const memberIds = leagueMembers[leagueId] || [];
  const members = mockUsers.filter((u) => memberIds.includes(u.userId));

  const rankedMembers = members
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((member, index) => ({
      ...member,
      position: index + 1,
    }));

  return {
    league,
    rankings: rankedMembers,
  };
}

export function getLeagueLeader(leagueId: string): MetricLeader | null {
  const ranking = getLeagueRanking(leagueId);
  if (!ranking || ranking.rankings.length === 0) return null;
  
  const leader = ranking.rankings[0];
  return {
    userId: leader.userId,
    userName: leader.userName,
    avatarUrl: leader.avatarUrl,
    value: leader.totalPoints,
    label: `${leader.totalPoints} pts`,
  };
}

export function getLeagueVice(leagueId: string): MetricLeader | null {
  const ranking = getLeagueRanking(leagueId);
  if (!ranking || ranking.rankings.length < 2) return null;
  
  const vice = ranking.rankings[1];
  return {
    userId: vice.userId,
    userName: vice.userName,
    avatarUrl: vice.avatarUrl,
    value: vice.totalPoints,
    label: `${vice.totalPoints} pts`,
  };
}

export function getLeagueLanterna(leagueId: string): MetricLeader | null {
  const ranking = getLeagueRanking(leagueId);
  if (!ranking || ranking.rankings.length === 0) return null;
  
  const lanterna = ranking.rankings[ranking.rankings.length - 1];
  return {
    userId: lanterna.userId,
    userName: lanterna.userName,
    avatarUrl: lanterna.avatarUrl,
    value: lanterna.totalPoints,
    label: `${lanterna.totalPoints} pts`,
  };
}

export function getLeagueTopVidente(leagueId: string): MetricLeader | null {
  const ranking = getLeagueRanking(leagueId);
  if (!ranking || ranking.rankings.length === 0) return null;
  
  const sorted = [...ranking.rankings].sort(
    (a, b) => b.uniqueExactPredictions - a.uniqueExactPredictions
  );
  const top = sorted[0];
  
  return {
    userId: top.userId,
    userName: top.userName,
    avatarUrl: top.avatarUrl,
    value: top.uniqueExactPredictions,
    label: `${top.uniqueExactPredictions} únicos`,
  };
}

export function getLeagueTopChallenger(leagueId: string): MetricLeader | null {
  const ranking = getLeagueRanking(leagueId);
  if (!ranking || ranking.rankings.length === 0) return null;
  
  const sorted = [...ranking.rankings].sort(
    (a, b) => b.challengeWins - a.challengeWins
  );
  const top = sorted[0];
  
  return {
    userId: top.userId,
    userName: top.userName,
    avatarUrl: top.avatarUrl,
    value: top.challengeWins,
    label: `${top.challengeWins} vitórias`,
  };
}

export function getUserMetrics(userId: string): UserMetrics | null {
  const user = mockUsers.find((u) => u.userId === userId);
  if (!user) return null;

  return {
    userId: user.userId,
    userName: user.userName,
    avatarUrl: user.avatarUrl,
    position: user.position,
    previousPosition: user.position + (user.movement === "up" ? user.positionChange : user.movement === "down" ? -user.positionChange : 0),
    totalPoints: user.totalPoints,
    pointsThisWeek: Math.floor(Math.random() * 30) + 10,
    exactPredictions: user.exactPredictions,
    uniqueExactPredictions: user.uniqueExactPredictions,
    correctResults: user.correctResults,
    correctFirstScorers: user.correctFirstScorers,
    totalPredictions: user.totalPredictions,
    challengeWins: user.challengeWins,
    challengeLosses: user.challengeLosses,
    currentStreak: user.currentStreak,
    bestStreak: user.currentStreak + Math.floor(Math.random() * 3),
    closeCallMisses: user.closeCallMisses,
    pointsBreakdown: {
      fromExactScores: user.exactPredictions * 10,
      fromResults: user.correctResults * 4,
      fromFirstScorer: user.correctFirstScorers * 2,
      fromChallenges: user.challengeWins * 3 - user.challengeLosses,
    },
    positionHistory: [
      { date: "Jun 11", position: user.position + 3 },
      { date: "Jun 12", position: user.position + 2 },
      { date: "Jun 13", position: user.position + 1 },
      { date: "Jun 14", position: user.position },
      { date: "Jun 15", position: user.position },
    ],
  };
}

export function getAverageStats(): {
  avgPoints: number;
  avgExact: number;
  avgChallengeWins: number;
} {
  const total = mockUsers.length;
  return {
    avgPoints: Math.round(mockUsers.reduce((sum, u) => sum + u.totalPoints, 0) / total),
    avgExact: Math.round((mockUsers.reduce((sum, u) => sum + u.exactPredictions, 0) / total) * 10) / 10,
    avgChallengeWins: Math.round((mockUsers.reduce((sum, u) => sum + u.challengeWins, 0) / total) * 10) / 10,
  };
}

function generateInviteCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function getAllLeagues(): League[] {
  return [...mockLeagues];
}

export function getLeagueByCode(code: string): League | null {
  return mockLeagues.find((l) => l.inviteCode.toUpperCase() === code.toUpperCase()) || null;
}

export function getLeagueById(id: string): League | null {
  return mockLeagues.find((l) => l.id === id) || null;
}

export function createLeague(
  name: string,
  description: string | undefined,
  creatorId: string,
  creatorName: string
): { success: boolean; league?: League; error?: string } {
  if (!name.trim()) {
    return { success: false, error: "Nome da liga é obrigatório" };
  }

  const newLeague: League = {
    id: `league_${Date.now()}`,
    name: name.trim(),
    description: description?.trim() || undefined,
    inviteCode: generateInviteCode(),
    createdBy: creatorId,
    createdByName: creatorName,
    memberCount: 1,
    createdAt: new Date(),
  };

  mockLeagues.push(newLeague);
  
  if (!leagueMembers[newLeague.id]) {
    leagueMembers[newLeague.id] = [];
  }
  leagueMembers[newLeague.id].push(creatorId);

  return { success: true, league: newLeague };
}

export function joinLeague(
  code: string,
  userId: string
): { success: boolean; league?: League; error?: string } {
  const league = getLeagueByCode(code);
  
  if (!league) {
    return { success: false, error: "Código inválido. Verifique e tente novamente." };
  }

  if (!leagueMembers[league.id]) {
    leagueMembers[league.id] = [];
  }

  if (leagueMembers[league.id].includes(userId)) {
    return { success: false, error: "Você já faz parte desta liga." };
  }

  leagueMembers[league.id].push(userId);
  
  const leagueIndex = mockLeagues.findIndex((l) => l.id === league.id);
  if (leagueIndex >= 0) {
    mockLeagues[leagueIndex] = {
      ...mockLeagues[leagueIndex],
      memberCount: mockLeagues[leagueIndex].memberCount + 1,
    };
  }

  return { success: true, league: mockLeagues[leagueIndex] };
}

export function getUserPositionInLeague(leagueId: string, userId: string): number | null {
  const ranking = getLeagueRanking(leagueId);
  if (!ranking) return null;
  
  const userRank = ranking.rankings.find((r) => r.userId === userId);
  return userRank?.position || null;
}
