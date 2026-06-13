// ============================================
// KNOCKOUT STAGE STRUCTURE - FIFA WORLD CUP 2026
// Source: https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/knockout-stage-match-schedule-bracket
// ============================================

export interface KnockoutMatchDefinition {
  matchNumber: number;
  date: string;
  time: string;
  venue: string;
  city: string;
  homeTeamLabel: string;
  awayTeamLabel: string;
  stage: "round32" | "round16" | "quarter" | "semi" | "third" | "final";
}

export const KNOCKOUT_MATCHES: KnockoutMatchDefinition[] = [
  // ============================================
  // 16 AVOS DE FINAL (Round of 32)
  // ============================================
  {
    matchNumber: 73,
    date: "2026-06-28",
    time: "12:00",
    venue: "Los Angeles Stadium",
    city: "Los Angeles",
    homeTeamLabel: "2º Grupo A",
    awayTeamLabel: "2º Grupo B",
    stage: "round32",
  },
  {
    matchNumber: 74,
    date: "2026-06-29",
    time: "12:00",
    venue: "Boston Stadium",
    city: "Boston",
    homeTeamLabel: "1º Grupo E",
    awayTeamLabel: "3º Grupo A/B/C/D/F",
    stage: "round32",
  },
  {
    matchNumber: 75,
    date: "2026-06-29",
    time: "16:00",
    venue: "Estadio Monterrey",
    city: "Monterrey",
    homeTeamLabel: "1º Grupo F",
    awayTeamLabel: "2º Grupo C",
    stage: "round32",
  },
  {
    matchNumber: 76,
    date: "2026-06-29",
    time: "20:00",
    venue: "Houston Stadium",
    city: "Houston",
    homeTeamLabel: "1º Grupo C",
    awayTeamLabel: "2º Grupo F",
    stage: "round32",
  },
  {
    matchNumber: 77,
    date: "2026-06-30",
    time: "12:00",
    venue: "MetLife Stadium",
    city: "New York/New Jersey",
    homeTeamLabel: "1º Grupo I",
    awayTeamLabel: "3º Grupo C/D/F/G/H",
    stage: "round32",
  },
  {
    matchNumber: 78,
    date: "2026-06-30",
    time: "16:00",
    venue: "AT&T Stadium",
    city: "Dallas",
    homeTeamLabel: "2º Grupo E",
    awayTeamLabel: "2º Grupo I",
    stage: "round32",
  },
  {
    matchNumber: 79,
    date: "2026-06-30",
    time: "20:00",
    venue: "Estadio Azteca",
    city: "Mexico City",
    homeTeamLabel: "1º Grupo A",
    awayTeamLabel: "3º Grupo C/E/F/H/I",
    stage: "round32",
  },
  {
    matchNumber: 80,
    date: "2026-07-01",
    time: "12:00",
    venue: "Mercedes-Benz Stadium",
    city: "Atlanta",
    homeTeamLabel: "1º Grupo L",
    awayTeamLabel: "3º Grupo E/H/I/J/K",
    stage: "round32",
  },
  {
    matchNumber: 81,
    date: "2026-07-01",
    time: "16:00",
    venue: "Levi's Stadium",
    city: "San Francisco",
    homeTeamLabel: "1º Grupo D",
    awayTeamLabel: "3º Grupo B/E/F/I/J",
    stage: "round32",
  },
  {
    matchNumber: 82,
    date: "2026-07-01",
    time: "20:00",
    venue: "Lumen Field",
    city: "Seattle",
    homeTeamLabel: "1º Grupo G",
    awayTeamLabel: "3º Grupo A/E/H/I/J",
    stage: "round32",
  },
  {
    matchNumber: 83,
    date: "2026-07-02",
    time: "12:00",
    venue: "BMO Field",
    city: "Toronto",
    homeTeamLabel: "2º Grupo K",
    awayTeamLabel: "2º Grupo L",
    stage: "round32",
  },
  {
    matchNumber: 84,
    date: "2026-07-02",
    time: "16:00",
    venue: "SoFi Stadium",
    city: "Los Angeles",
    homeTeamLabel: "1º Grupo H",
    awayTeamLabel: "2º Grupo J",
    stage: "round32",
  },
  {
    matchNumber: 85,
    date: "2026-07-02",
    time: "20:00",
    venue: "BC Place",
    city: "Vancouver",
    homeTeamLabel: "1º Grupo B",
    awayTeamLabel: "3º Grupo E/F/G/I/J",
    stage: "round32",
  },
  {
    matchNumber: 86,
    date: "2026-07-03",
    time: "12:00",
    venue: "Hard Rock Stadium",
    city: "Miami",
    homeTeamLabel: "1º Grupo J",
    awayTeamLabel: "2º Grupo H",
    stage: "round32",
  },
  {
    matchNumber: 87,
    date: "2026-07-03",
    time: "16:00",
    venue: "Arrowhead Stadium",
    city: "Kansas City",
    homeTeamLabel: "1º Grupo K",
    awayTeamLabel: "3º Grupo D/E/I/J/L",
    stage: "round32",
  },
  {
    matchNumber: 88,
    date: "2026-07-03",
    time: "20:00",
    venue: "AT&T Stadium",
    city: "Dallas",
    homeTeamLabel: "2º Grupo D",
    awayTeamLabel: "2º Grupo G",
    stage: "round32",
  },

  // ============================================
  // OITAVAS DE FINAL (Round of 16)
  // ============================================
  {
    matchNumber: 89,
    date: "2026-07-04",
    time: "12:00",
    venue: "Lincoln Financial Field",
    city: "Philadelphia",
    homeTeamLabel: "Vencedor Jogo 74",
    awayTeamLabel: "Vencedor Jogo 77",
    stage: "round16",
  },
  {
    matchNumber: 90,
    date: "2026-07-04",
    time: "18:00",
    venue: "NRG Stadium",
    city: "Houston",
    homeTeamLabel: "Vencedor Jogo 73",
    awayTeamLabel: "Vencedor Jogo 75",
    stage: "round16",
  },
  {
    matchNumber: 91,
    date: "2026-07-05",
    time: "12:00",
    venue: "MetLife Stadium",
    city: "New York/New Jersey",
    homeTeamLabel: "Vencedor Jogo 76",
    awayTeamLabel: "Vencedor Jogo 78",
    stage: "round16",
  },
  {
    matchNumber: 92,
    date: "2026-07-05",
    time: "18:00",
    venue: "Estadio Azteca",
    city: "Mexico City",
    homeTeamLabel: "Vencedor Jogo 79",
    awayTeamLabel: "Vencedor Jogo 80",
    stage: "round16",
  },
  {
    matchNumber: 93,
    date: "2026-07-06",
    time: "12:00",
    venue: "AT&T Stadium",
    city: "Dallas",
    homeTeamLabel: "Vencedor Jogo 83",
    awayTeamLabel: "Vencedor Jogo 84",
    stage: "round16",
  },
  {
    matchNumber: 94,
    date: "2026-07-06",
    time: "18:00",
    venue: "Lumen Field",
    city: "Seattle",
    homeTeamLabel: "Vencedor Jogo 81",
    awayTeamLabel: "Vencedor Jogo 82",
    stage: "round16",
  },
  {
    matchNumber: 95,
    date: "2026-07-07",
    time: "12:00",
    venue: "Mercedes-Benz Stadium",
    city: "Atlanta",
    homeTeamLabel: "Vencedor Jogo 86",
    awayTeamLabel: "Vencedor Jogo 88",
    stage: "round16",
  },
  {
    matchNumber: 96,
    date: "2026-07-07",
    time: "18:00",
    venue: "BC Place",
    city: "Vancouver",
    homeTeamLabel: "Vencedor Jogo 85",
    awayTeamLabel: "Vencedor Jogo 87",
    stage: "round16",
  },

  // ============================================
  // QUARTAS DE FINAL (Quarter-finals)
  // ============================================
  {
    matchNumber: 97,
    date: "2026-07-09",
    time: "15:00",
    venue: "Gillette Stadium",
    city: "Boston",
    homeTeamLabel: "Vencedor Jogo 89",
    awayTeamLabel: "Vencedor Jogo 90",
    stage: "quarter",
  },
  {
    matchNumber: 98,
    date: "2026-07-10",
    time: "15:00",
    venue: "SoFi Stadium",
    city: "Los Angeles",
    homeTeamLabel: "Vencedor Jogo 93",
    awayTeamLabel: "Vencedor Jogo 94",
    stage: "quarter",
  },
  {
    matchNumber: 99,
    date: "2026-07-11",
    time: "12:00",
    venue: "Hard Rock Stadium",
    city: "Miami",
    homeTeamLabel: "Vencedor Jogo 91",
    awayTeamLabel: "Vencedor Jogo 92",
    stage: "quarter",
  },
  {
    matchNumber: 100,
    date: "2026-07-11",
    time: "18:00",
    venue: "Arrowhead Stadium",
    city: "Kansas City",
    homeTeamLabel: "Vencedor Jogo 95",
    awayTeamLabel: "Vencedor Jogo 96",
    stage: "quarter",
  },

  // ============================================
  // SEMIFINAL (Semi-finals)
  // ============================================
  {
    matchNumber: 101,
    date: "2026-07-14",
    time: "18:00",
    venue: "AT&T Stadium",
    city: "Dallas",
    homeTeamLabel: "Vencedor Jogo 97",
    awayTeamLabel: "Vencedor Jogo 98",
    stage: "semi",
  },
  {
    matchNumber: 102,
    date: "2026-07-15",
    time: "18:00",
    venue: "Mercedes-Benz Stadium",
    city: "Atlanta",
    homeTeamLabel: "Vencedor Jogo 99",
    awayTeamLabel: "Vencedor Jogo 100",
    stage: "semi",
  },

  // ============================================
  // DISPUTA DE 3º LUGAR (Third Place)
  // ============================================
  {
    matchNumber: 103,
    date: "2026-07-18",
    time: "15:00",
    venue: "Hard Rock Stadium",
    city: "Miami",
    homeTeamLabel: "Perdedor Jogo 101",
    awayTeamLabel: "Perdedor Jogo 102",
    stage: "third",
  },

  // ============================================
  // FINAL
  // ============================================
  {
    matchNumber: 104,
    date: "2026-07-19",
    time: "15:00",
    venue: "MetLife Stadium",
    city: "New York/New Jersey",
    homeTeamLabel: "Vencedor Jogo 101",
    awayTeamLabel: "Vencedor Jogo 102",
    stage: "final",
  },
];

export function getKnockoutMatchesByStage(
  stage: "round32" | "round16" | "quarter" | "semi" | "final"
): KnockoutMatchDefinition[] {
  if (stage === "final") {
    return KNOCKOUT_MATCHES.filter((m) => m.stage === "final" || m.stage === "third");
  }
  return KNOCKOUT_MATCHES.filter((m) => m.stage === stage);
}
