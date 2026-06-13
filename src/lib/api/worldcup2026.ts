// ============================================
// WORLDCUP2026 API SERVICE
// Free API - No auth required for read access
// Source: https://github.com/rezarahiminia/worldcup2026
// ============================================

import { Match, Team } from "@/types";
import { getTeamCrest } from "@/lib/team-crests";

const API_BASE_URL = "https://wc2026.moothz.win";

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiStadium {
  _id: string;
  id: string;
  name_en: string;
  name_fa: string;
  fifa_name: string;
  city_en: string;
  city_fa: string;
  country_en: string;
  country_fa: string;
  capacity: number;
  region: string;
  createdAt: string;
}

export interface ApiTeam {
  _id: string;
  id: string;
  name_en: string;
  name_fa: string;
  code: string;
  flag_emoji: string;
  group: string;
  createdAt: string;
}

export interface ApiGame {
  _id: string;
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: string;
  away_score: string;
  home_scorers: string;
  away_scorers: string;
  group: string;
  matchday: string;
  local_date: string;
  persian_date: string;
  stadium_id: string;
  finished: string;
  time_elapsed: "notstarted" | "live" | "finished";
  type: "group" | "round16" | "quarter" | "semi" | "third" | "final";
  home_team_label: string;
  away_team_label: string;
  homeTeam: string;
  visitingTeam: string;
  date: string;
  createdAt: string;
  home_team_name_en: string;
  home_team_name_fa: string;
  away_team_name_en: string;
  away_team_name_fa: string;
}

export interface ApiStadiumsResponse {
  stadiums: ApiStadium[];
}

export interface ApiTeamsResponse {
  teams: ApiTeam[];
}

export interface ApiGamesResponse {
  games: ApiGame[];
}

export interface ApiTeamStanding {
  team_id: string;
  mp: string;  // matches played
  w: string;   // wins
  l: string;   // losses
  d: string;   // draws
  pts: string; // points
  gf: string;  // goals for
  ga: string;  // goals against
  gd: string;  // goal difference
  _id: string;
}

export interface ApiGroup {
  _id: string;
  name: string;
  teams: ApiTeamStanding[];
  createdAt: string;
}

export interface ApiGroupsResponse {
  groups: ApiGroup[];
}

// ============================================
// API CLIENT
// ============================================

class WorldCup2026API {
  private stadiumsCache: Map<string, ApiStadium> | null = null;
  private teamsCache: Map<string, ApiTeam> | null = null;

  private async fetch<T>(endpoint: string): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      next: {
        revalidate: 300, // Cache for 5 minutes
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getStadiums(): Promise<ApiStadium[]> {
    const data = await this.fetch<ApiStadiumsResponse>("/get/stadiums");
    return data.stadiums;
  }

  async getTeams(): Promise<ApiTeam[]> {
    const data = await this.fetch<ApiTeamsResponse>("/get/teams");
    return data.teams;
  }

  async getGames(): Promise<ApiGame[]> {
    const data = await this.fetch<ApiGamesResponse>("/get/games");
    return data.games;
  }

  async getGroups(): Promise<ApiGroupsResponse["groups"]> {
    const data = await this.fetch<ApiGroupsResponse>("/get/groups");
    return data.groups;
  }

  async getStadiumsMap(): Promise<Map<string, ApiStadium>> {
    if (this.stadiumsCache) return this.stadiumsCache;

    const stadiums = await this.getStadiums();
    this.stadiumsCache = new Map(stadiums.map((s) => [s.id, s]));
    return this.stadiumsCache;
  }

  async getTeamsMap(): Promise<Map<string, ApiTeam>> {
    if (this.teamsCache) return this.teamsCache;

    const teams = await this.getTeams();
    this.teamsCache = new Map(teams.map((t) => [t.id, t]));
    return this.teamsCache;
  }
}

export const worldCup2026API = new WorldCup2026API();

// ============================================
// DATA TRANSFORMATION FUNCTIONS
// ============================================

const TLA_MAP: Record<string, string> = {
  Mexico: "MEX",
  "South Africa": "RSA",
  "South Korea": "KOR",
  "Czech Republic": "CZE",
  Canada: "CAN",
  "Bosnia and Herzegovina": "BIH",
  Qatar: "QAT",
  Switzerland: "SUI",
  Brazil: "BRA",
  Morocco: "MAR",
  Haiti: "HAI",
  Scotland: "SCO",
  "United States": "USA",
  Paraguay: "PAR",
  Australia: "AUS",
  Turkey: "TUR",
  Germany: "GER",
  "Curaçao": "CUW",
  "Ivory Coast": "CIV",
  Ecuador: "ECU",
  Netherlands: "NED",
  Japan: "JPN",
  Sweden: "SWE",
  Tunisia: "TUN",
  Belgium: "BEL",
  Egypt: "EGY",
  Iran: "IRN",
  "New Zealand": "NZL",
  Spain: "ESP",
  "Cape Verde": "CPV",
  "Saudi Arabia": "KSA",
  Uruguay: "URU",
  France: "FRA",
  Senegal: "SEN",
  Iraq: "IRQ",
  Norway: "NOR",
  Argentina: "ARG",
  Algeria: "ALG",
  Austria: "AUT",
  Jordan: "JOR",
  Portugal: "POR",
  "DR Congo": "COD",
  Uzbekistan: "UZB",
  Colombia: "COL",
  England: "ENG",
  Croatia: "CRO",
  Ghana: "GHA",
  Panama: "PAN",
};

function getTLAFromName(name: string): string {
  return TLA_MAP[name] || name.substring(0, 3).toUpperCase();
}

function getFlagEmoji(tla: string): string {
  const flagMap: Record<string, string> = {
    MEX: "🇲🇽",
    RSA: "🇿🇦",
    KOR: "🇰🇷",
    CZE: "🇨🇿",
    CAN: "🇨🇦",
    BIH: "🇧🇦",
    QAT: "🇶🇦",
    SUI: "🇨🇭",
    BRA: "🇧🇷",
    MAR: "🇲🇦",
    HAI: "🇭🇹",
    SCO: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    USA: "🇺🇸",
    PAR: "🇵🇾",
    AUS: "🇦🇺",
    TUR: "🇹🇷",
    GER: "🇩🇪",
    CUW: "🇨🇼",
    CIV: "🇨🇮",
    ECU: "🇪🇨",
    NED: "🇳🇱",
    JPN: "🇯🇵",
    SWE: "🇸🇪",
    TUN: "🇹🇳",
    BEL: "🇧🇪",
    EGY: "🇪🇬",
    IRN: "🇮🇷",
    NZL: "🇳🇿",
    ESP: "🇪🇸",
    CPV: "🇨🇻",
    KSA: "🇸🇦",
    URU: "🇺🇾",
    FRA: "🇫🇷",
    SEN: "🇸🇳",
    IRQ: "🇮🇶",
    NOR: "🇳🇴",
    ARG: "🇦🇷",
    ALG: "🇩🇿",
    AUT: "🇦🇹",
    JOR: "🇯🇴",
    POR: "🇵🇹",
    COD: "🇨🇩",
    UZB: "🇺🇿",
    COL: "🇨🇴",
    ENG: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    CRO: "🇭🇷",
    GHA: "🇬🇭",
    PAN: "🇵🇦",
  };
  return flagMap[tla] || "🏳️";
}

export function transformApiTeam(
  teamName: string | null,
  teamId: string | null
): Team {
  if (!teamName || teamName === "TBD" || teamName === "") {
    return {
      id: teamId || "tbd",
      name: "A definir",
      code: "TBD",
      flag: "🏳️",
    };
  }

  const tla = getTLAFromName(teamName);
  const officialCrest = getTeamCrest(tla);

  return {
    id: teamId || tla.toLowerCase(),
    name: teamName,
    code: tla,
    flag: officialCrest || getFlagEmoji(tla),
  };
}

export function transformApiGame(
  game: ApiGame,
  stadiumsMap: Map<string, ApiStadium>
): Match {
  const homeTeam = transformApiTeam(game.home_team_name_en, game.home_team_id);
  const awayTeam = transformApiTeam(game.away_team_name_en, game.away_team_id);

  let status: Match["status"] = "scheduled";
  if (game.time_elapsed === "live") {
    status = "live";
  } else if (game.finished === "TRUE" || game.time_elapsed === "finished") {
    status = "finished";
  }

  const hasScore =
    game.home_score !== null &&
    game.away_score !== null &&
    game.home_score !== "null" &&
    game.away_score !== "null" &&
    game.home_score !== "" &&
    game.away_score !== "";

  const stadium = stadiumsMap.get(game.stadium_id);

  let stage: Match["stage"] = "group";
  if (game.type === "round16") stage = "round16";
  else if (game.type === "quarter") stage = "quarter";
  else if (game.type === "semi") stage = "semi";
  else if (game.type === "third") stage = "third";
  else if (game.type === "final") stage = "final";

  // Parse local_date (US Eastern Time) and convert to proper UTC
  // The API's date field has a 1-hour error, so we use local_date instead
  let matchDate: Date;
  if (game.local_date) {
    // local_date format: "MM/DD/YYYY HH:mm" in US Eastern Time
    const [datePart, timePart] = game.local_date.split(' ');
    const [month, day, year] = datePart.split('/');
    const [hour, minute] = timePart.split(':');
    // Create date string in ISO format with US Eastern offset (-04:00 for EDT summer time)
    matchDate = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00-04:00`);
  } else {
    matchDate = new Date(game.date);
  }

  return {
    id: game.id,
    homeTeam,
    awayTeam,
    date: matchDate,
    stage,
    group: game.group || undefined,
    venue: stadium?.name_en || stadium?.fifa_name || "A definir",
    city: stadium?.city_en || "",
    status,
    score: hasScore
      ? {
          home: parseInt(game.home_score, 10),
          away: parseInt(game.away_score, 10),
        }
      : undefined,
  };
}

// ============================================
// HIGH-LEVEL DATA FETCHING FUNCTIONS
// ============================================

export async function getAllMatches(): Promise<Match[]> {
  const [games, stadiumsMap] = await Promise.all([
    worldCup2026API.getGames(),
    worldCup2026API.getStadiumsMap(),
  ]);

  return games
    .map((game) => transformApiGame(game, stadiumsMap))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

export async function getMatchesByStage(
  stage: Match["stage"]
): Promise<Match[]> {
  const matches = await getAllMatches();
  return matches.filter((m) => m.stage === stage);
}

export async function getMatchesByGroup(group: string): Promise<Match[]> {
  const matches = await getAllMatches();
  return matches.filter((m) => m.group === group);
}

export async function getLiveMatches(): Promise<Match[]> {
  const matches = await getAllMatches();
  return matches.filter((m) => m.status === "live");
}

export async function getTodayMatches(): Promise<Match[]> {
  const matches = await getAllMatches();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return matches.filter((m) => {
    const matchDate = new Date(m.date);
    return matchDate >= today && matchDate < tomorrow;
  });
}

export async function getUpcomingMatches(limit?: number): Promise<Match[]> {
  const matches = await getAllMatches();
  const now = new Date();

  const upcoming = matches.filter((m) => m.date > now && m.status === "scheduled");

  return limit ? upcoming.slice(0, limit) : upcoming;
}

export async function getRecentMatches(limit?: number): Promise<Match[]> {
  const matches = await getAllMatches();
  const now = new Date();

  const finished = matches
    .filter((m) => m.status === "finished" || m.date < now)
    .reverse();

  return limit ? finished.slice(0, limit) : finished;
}

// ============================================
// STANDINGS FUNCTIONS
// ============================================

import { GroupStanding, TeamStanding } from "@/types";

export async function getGroupStandings(): Promise<GroupStanding[]> {
  const [groups, teamsMap, games] = await Promise.all([
    worldCup2026API.getGroups(),
    worldCup2026API.getTeamsMap(),
    worldCup2026API.getGames(),
  ]);

  return groups.map((group) => {
    const standings: TeamStanding[] = group.teams
      .map((teamStanding, index) => {
        const apiTeam = teamsMap.get(teamStanding.team_id);
        const teamName = apiTeam?.name_en || "Unknown";
        const tla = getTLAFromName(teamName);
        const officialCrest = getTeamCrest(tla);

        const played = parseInt(teamStanding.mp, 10) || 0;
        const won = parseInt(teamStanding.w, 10) || 0;
        const drawn = parseInt(teamStanding.d, 10) || 0;
        const lost = parseInt(teamStanding.l, 10) || 0;
        const points = parseInt(teamStanding.pts, 10) || 0;
        const goalsFor = parseInt(teamStanding.gf, 10) || 0;
        const goalsAgainst = parseInt(teamStanding.ga, 10) || 0;
        const goalDifference = parseInt(teamStanding.gd, 10) || 0;

        const maxPoints = played * 3;
        const percentage = maxPoints > 0 ? Math.round((points / maxPoints) * 100) : 0;

        const recentResults = getTeamRecentResults(
          teamStanding.team_id,
          games,
          3
        );

        return {
          position: index + 1,
          team: {
            id: teamStanding.team_id,
            name: teamName,
            code: tla,
            flag: officialCrest || getFlagEmoji(tla),
          },
          played,
          won,
          drawn,
          lost,
          goalsFor,
          goalsAgainst,
          goalDifference,
          points,
          percentage,
          recentResults,
        };
      })
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
        return 0;
      })
      .map((standing, index) => ({ ...standing, position: index + 1 }));

    return {
      name: group.name,
      standings,
    };
  });
}

function getTeamRecentResults(
  teamId: string,
  games: ApiGame[],
  limit: number
): ("W" | "D" | "L")[] {
  const teamGames = games
    .filter(
      (g) =>
        (g.home_team_id === teamId || g.away_team_id === teamId) &&
        g.finished === "TRUE"
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);

  return teamGames.map((game) => {
    const homeScore = parseInt(game.home_score, 10) || 0;
    const awayScore = parseInt(game.away_score, 10) || 0;
    const isHome = game.home_team_id === teamId;

    if (homeScore === awayScore) return "D";
    if (isHome) {
      return homeScore > awayScore ? "W" : "L";
    } else {
      return awayScore > homeScore ? "W" : "L";
    }
  });
}
