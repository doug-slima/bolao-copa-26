// ============================================
// FOOTBALL-DATA.ORG API TYPES
// https://www.football-data.org/documentation/api
// ============================================

export interface ApiArea {
  id: number;
  name: string;
  code: string;
  flag: string | null;
}

export interface ApiCompetition {
  id: number;
  name: string;
  code: string;
  type: string;
  emblem: string | null;
}

export interface ApiSeason {
  id: number;
  startDate: string;
  endDate: string;
  currentMatchday: number | null;
  winner: ApiTeam | null;
}

export interface ApiTeam {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string | null;
}

export interface ApiScore {
  winner: "HOME_TEAM" | "AWAY_TEAM" | "DRAW" | null;
  duration: "REGULAR" | "EXTRA_TIME" | "PENALTY_SHOOTOUT";
  fullTime: {
    home: number | null;
    away: number | null;
  };
  halfTime: {
    home: number | null;
    away: number | null;
  };
}

export interface ApiMatch {
  id: number;
  utcDate: string;
  status: "SCHEDULED" | "TIMED" | "IN_PLAY" | "PAUSED" | "FINISHED" | "SUSPENDED" | "POSTPONED" | "CANCELLED" | "AWARDED";
  matchday: number | null;
  stage: string;
  group: string | null;
  lastUpdated: string;
  homeTeam: ApiTeam;
  awayTeam: ApiTeam;
  score: ApiScore;
  odds?: {
    homeWin: number;
    draw: number;
    awayWin: number;
  };
  referees?: Array<{
    id: number;
    name: string;
    type: string;
    nationality: string;
  }>;
  venue?: string;
}

export interface ApiMatchesResponse {
  filters: Record<string, string>;
  resultSet: {
    count: number;
    competitions: string;
    first: string;
    last: string;
    played: number;
  };
  matches: ApiMatch[];
}

export interface ApiStanding {
  stage: string;
  type: "TOTAL" | "HOME" | "AWAY";
  group: string | null;
  table: Array<{
    position: number;
    team: ApiTeam;
    playedGames: number;
    form: string | null;
    won: number;
    draw: number;
    lost: number;
    points: number;
    goalsFor: number;
    goalsAgainst: number;
    goalDifference: number;
  }>;
}

export interface ApiStandingsResponse {
  filters: Record<string, string>;
  competition: ApiCompetition;
  season: ApiSeason;
  standings: ApiStanding[];
}

export interface ApiTeamsResponse {
  count: number;
  filters: Record<string, string>;
  competition: ApiCompetition;
  season: ApiSeason;
  teams: ApiTeam[];
}

export interface ApiCompetitionResponse {
  area: ApiArea;
  id: number;
  name: string;
  code: string;
  type: string;
  emblem: string | null;
  currentSeason: ApiSeason;
  seasons: ApiSeason[];
}
