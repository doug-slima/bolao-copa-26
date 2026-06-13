// ============================================
// DATA FETCHING SERVICE
// Uses WorldCup2026 API with fallback to mock data
// ============================================

import { Match, Team, GroupStanding } from "@/types";
import {
  getAllMatches as apiGetAllMatches,
  getMatchesByStage as apiGetMatchesByStage,
  getMatchesByGroup as apiGetMatchesByGroup,
  getLiveMatches as apiGetLiveMatches,
  getTodayMatches as apiGetTodayMatches,
  getUpcomingMatches as apiGetUpcomingMatches,
  getRecentMatches as apiGetRecentMatches,
  getGroupStandings as apiGetGroupStandings,
  worldCup2026API,
  transformApiTeam,
} from "./worldcup2026";
import { matches as mockMatches, teams as mockTeams } from "../mock-data";

const USE_MOCK = process.env.USE_MOCK_DATA === "true";

export async function getAllMatches(): Promise<Match[]> {
  if (USE_MOCK) {
    console.log("Using mock data (USE_MOCK_DATA=true)");
    return mockMatches;
  }

  try {
    return await apiGetAllMatches();
  } catch (error) {
    console.error("Failed to fetch matches from API, using mock data:", error);
    return mockMatches;
  }
}

export async function getMatchById(id: string): Promise<Match | undefined> {
  const allMatches = await getAllMatches();
  return allMatches.find((m) => m.id === id);
}

export async function getMatchesByStage(stage: Match["stage"]): Promise<Match[]> {
  if (USE_MOCK) {
    return mockMatches.filter((m) => m.stage === stage);
  }

  try {
    return await apiGetMatchesByStage(stage);
  } catch (error) {
    console.error("Failed to fetch matches by stage, using mock data:", error);
    return mockMatches.filter((m) => m.stage === stage);
  }
}

export async function getMatchesByGroup(group: string): Promise<Match[]> {
  if (USE_MOCK) {
    return mockMatches.filter((m) => m.group === group);
  }

  try {
    return await apiGetMatchesByGroup(group);
  } catch (error) {
    console.error("Failed to fetch matches by group, using mock data:", error);
    return mockMatches.filter((m) => m.group === group);
  }
}

export async function getMatchesByDate(date: Date): Promise<Match[]> {
  const allMatches = await getAllMatches();
  return allMatches.filter(
    (m) => m.date.toDateString() === date.toDateString()
  );
}

export async function getUpcomingMatches(limit = 6): Promise<Match[]> {
  if (USE_MOCK) {
    const now = new Date();
    return mockMatches
      .filter((m) => m.date > now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, limit);
  }

  try {
    return await apiGetUpcomingMatches(limit);
  } catch (error) {
    console.error("Failed to fetch upcoming matches, using mock data:", error);
    const now = new Date();
    return mockMatches
      .filter((m) => m.date > now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, limit);
  }
}

export async function getLiveMatches(): Promise<Match[]> {
  if (USE_MOCK) {
    return mockMatches.filter((m) => m.status === "live");
  }

  try {
    return await apiGetLiveMatches();
  } catch (error) {
    console.error("Failed to fetch live matches, using mock data:", error);
    return mockMatches.filter((m) => m.status === "live");
  }
}

export async function getTodayMatches(): Promise<Match[]> {
  if (USE_MOCK) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return mockMatches.filter((m) => m.date >= today && m.date < tomorrow);
  }

  try {
    return await apiGetTodayMatches();
  } catch (error) {
    console.error("Failed to fetch today's matches, using mock data:", error);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return mockMatches.filter((m) => m.date >= today && m.date < tomorrow);
  }
}

export async function getRecentMatches(limit = 5): Promise<Match[]> {
  if (USE_MOCK) {
    return mockMatches
      .filter((m) => m.status === "finished")
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }

  try {
    return await apiGetRecentMatches(limit);
  } catch (error) {
    console.error("Failed to fetch recent matches, using mock data:", error);
    return mockMatches
      .filter((m) => m.status === "finished")
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }
}

export async function getAllTeams(): Promise<Team[]> {
  if (USE_MOCK) {
    return mockTeams;
  }

  try {
    const teams = await worldCup2026API.getTeams();
    return teams.map((t) => {
      const team = transformApiTeam(t.name_en, t.id);
      return team;
    });
  } catch (error) {
    console.error("Failed to fetch teams from API, using mock data:", error);
    return mockTeams;
  }
}

export async function getGroupStandings(): Promise<GroupStanding[]> {
  if (USE_MOCK) {
    return [];
  }

  try {
    return await apiGetGroupStandings();
  } catch (error) {
    console.error("Failed to fetch group standings:", error);
    return [];
  }
}

export const USE_API = !USE_MOCK;
