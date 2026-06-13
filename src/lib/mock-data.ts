import { Team, Match } from "@/types";

// ============================================
// TIMES OFICIAIS - FIFA WORLD CUP 2026
// 48 times em 12 grupos
// ============================================

export const teams: Team[] = [
  // Group A
  { id: "mex", name: "México", code: "MEX", flag: "🇲🇽" },
  { id: "rsa", name: "África do Sul", code: "RSA", flag: "🇿🇦" },
  { id: "kor", name: "Coreia do Sul", code: "KOR", flag: "🇰🇷" },
  { id: "cze", name: "Tchéquia", code: "CZE", flag: "🇨🇿" },

  // Group B
  { id: "can", name: "Canadá", code: "CAN", flag: "🇨🇦" },
  { id: "bih", name: "Bósnia e Herzegovina", code: "BIH", flag: "🇧🇦" },
  { id: "qat", name: "Catar", code: "QAT", flag: "🇶🇦" },
  { id: "sui", name: "Suíça", code: "SUI", flag: "🇨🇭" },

  // Group C
  { id: "bra", name: "Brasil", code: "BRA", flag: "🇧🇷" },
  { id: "mar", name: "Marrocos", code: "MAR", flag: "🇲🇦" },
  { id: "hai", name: "Haiti", code: "HAI", flag: "🇭🇹" },
  { id: "sco", name: "Escócia", code: "SCO", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },

  // Group D
  { id: "usa", name: "Estados Unidos", code: "USA", flag: "🇺🇸" },
  { id: "par", name: "Paraguai", code: "PAR", flag: "🇵🇾" },
  { id: "aus", name: "Austrália", code: "AUS", flag: "🇦🇺" },
  { id: "tur", name: "Turquia", code: "TUR", flag: "🇹🇷" },

  // Group E
  { id: "ger", name: "Alemanha", code: "GER", flag: "🇩🇪" },
  { id: "cuw", name: "Curaçao", code: "CUW", flag: "🇨🇼" },
  { id: "civ", name: "Costa do Marfim", code: "CIV", flag: "🇨🇮" },
  { id: "ecu", name: "Equador", code: "ECU", flag: "🇪🇨" },

  // Group F
  { id: "ned", name: "Holanda", code: "NED", flag: "🇳🇱" },
  { id: "jpn", name: "Japão", code: "JPN", flag: "🇯🇵" },
  { id: "swe", name: "Suécia", code: "SWE", flag: "🇸🇪" },
  { id: "tun", name: "Tunísia", code: "TUN", flag: "🇹🇳" },

  // Group G
  { id: "bel", name: "Bélgica", code: "BEL", flag: "🇧🇪" },
  { id: "egy", name: "Egito", code: "EGY", flag: "🇪🇬" },
  { id: "irn", name: "Irã", code: "IRN", flag: "🇮🇷" },
  { id: "nzl", name: "Nova Zelândia", code: "NZL", flag: "🇳🇿" },

  // Group H
  { id: "esp", name: "Espanha", code: "ESP", flag: "🇪🇸" },
  { id: "cpv", name: "Cabo Verde", code: "CPV", flag: "🇨🇻" },
  { id: "ksa", name: "Arábia Saudita", code: "KSA", flag: "🇸🇦" },
  { id: "uru", name: "Uruguai", code: "URU", flag: "🇺🇾" },

  // Group I
  { id: "fra", name: "França", code: "FRA", flag: "🇫🇷" },
  { id: "sen", name: "Senegal", code: "SEN", flag: "🇸🇳" },
  { id: "irq", name: "Iraque", code: "IRQ", flag: "🇮🇶" },
  { id: "nor", name: "Noruega", code: "NOR", flag: "🇳🇴" },

  // Group J
  { id: "arg", name: "Argentina", code: "ARG", flag: "🇦🇷" },
  { id: "alg", name: "Argélia", code: "ALG", flag: "🇩🇿" },
  { id: "aut", name: "Áustria", code: "AUT", flag: "🇦🇹" },
  { id: "jor", name: "Jordânia", code: "JOR", flag: "🇯🇴" },

  // Group K
  { id: "por", name: "Portugal", code: "POR", flag: "🇵🇹" },
  { id: "cod", name: "RD Congo", code: "COD", flag: "🇨🇩" },
  { id: "uzb", name: "Uzbequistão", code: "UZB", flag: "🇺🇿" },
  { id: "col", name: "Colômbia", code: "COL", flag: "🇨🇴" },

  // Group L
  { id: "eng", name: "Inglaterra", code: "ENG", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { id: "cro", name: "Croácia", code: "CRO", flag: "🇭🇷" },
  { id: "gha", name: "Gana", code: "GHA", flag: "🇬🇭" },
  { id: "pan", name: "Panamá", code: "PAN", flag: "🇵🇦" },
];

// ============================================
// ESTÁDIOS OFICIAIS - 16 SEDES
// ============================================

export const venues = [
  { id: "azteca", name: "Estadio Azteca", city: "Cidade do México", country: "MEX", timezone: "America/Mexico_City" },
  { id: "akron", name: "Estadio Akron", city: "Guadalajara", country: "MEX", timezone: "America/Mexico_City" },
  { id: "bbva", name: "Estadio BBVA", city: "Monterrey", country: "MEX", timezone: "America/Monterrey" },
  { id: "bmo", name: "BMO Field", city: "Toronto", country: "CAN", timezone: "America/Toronto" },
  { id: "bcplace", name: "BC Place", city: "Vancouver", country: "CAN", timezone: "America/Vancouver" },
  { id: "metlife", name: "MetLife Stadium", city: "Nova York/Nova Jersey", country: "USA", timezone: "America/New_York" },
  { id: "sofi", name: "SoFi Stadium", city: "Los Angeles", country: "USA", timezone: "America/Los_Angeles" },
  { id: "att", name: "AT&T Stadium", city: "Dallas", country: "USA", timezone: "America/Chicago" },
  { id: "hardrock", name: "Hard Rock Stadium", city: "Miami", country: "USA", timezone: "America/New_York" },
  { id: "mercedes", name: "Mercedes-Benz Stadium", city: "Atlanta", country: "USA", timezone: "America/New_York" },
  { id: "nrg", name: "NRG Stadium", city: "Houston", country: "USA", timezone: "America/Chicago" },
  { id: "gillette", name: "Gillette Stadium", city: "Boston", country: "USA", timezone: "America/New_York" },
  { id: "arrowhead", name: "Arrowhead Stadium", city: "Kansas City", country: "USA", timezone: "America/Chicago" },
  { id: "lincoln", name: "Lincoln Financial Field", city: "Filadélfia", country: "USA", timezone: "America/New_York" },
  { id: "levis", name: "Levi's Stadium", city: "San Francisco", country: "USA", timezone: "America/Los_Angeles" },
  { id: "lumen", name: "Lumen Field", city: "Seattle", country: "USA", timezone: "America/Los_Angeles" },
];

// ============================================
// GRUPOS
// ============================================

export const groups = {
  A: ["mex", "rsa", "kor", "cze"],
  B: ["can", "bih", "qat", "sui"],
  C: ["bra", "mar", "hai", "sco"],
  D: ["usa", "par", "aus", "tur"],
  E: ["ger", "cuw", "civ", "ecu"],
  F: ["ned", "jpn", "swe", "tun"],
  G: ["bel", "egy", "irn", "nzl"],
  H: ["esp", "cpv", "ksa", "uru"],
  I: ["fra", "sen", "irq", "nor"],
  J: ["arg", "alg", "aut", "jor"],
  K: ["por", "cod", "uzb", "col"],
  L: ["eng", "cro", "gha", "pan"],
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function getTeam(id: string): Team {
  const team = teams.find((t) => t.id === id);
  if (!team) throw new Error(`Team not found: ${id}`);
  return team;
}

function createMatch(
  id: string,
  homeId: string,
  awayId: string,
  dateStr: string,
  timeET: string,
  stage: Match["stage"],
  venueId: string,
  group?: string
): Match {
  const venue = venues.find((v) => v.id === venueId);
  if (!venue) throw new Error(`Venue not found: ${venueId}`);
  
  return {
    id,
    homeTeam: getTeam(homeId),
    awayTeam: getTeam(awayId),
    date: new Date(`${dateStr}T${timeET}:00-04:00`), // ET timezone
    stage,
    group,
    venue: venue.name,
    city: venue.city,
    status: "scheduled",
  };
}

// ============================================
// JOGOS OFICIAIS - FASE DE GRUPOS
// Horários em ET (Eastern Time)
// ============================================

export const matches: Match[] = [
  // ========== GRUPO A ==========
  // Rodada 1
  createMatch("a1", "mex", "rsa", "2026-06-11", "15:00", "group", "azteca", "A"),
  createMatch("a2", "kor", "cze", "2026-06-12", "12:00", "group", "akron", "A"),
  // Rodada 2
  createMatch("a3", "mex", "kor", "2026-06-18", "18:00", "group", "azteca", "A"),
  createMatch("a4", "rsa", "cze", "2026-06-18", "12:00", "group", "mercedes", "A"),
  // Rodada 3
  createMatch("a5", "cze", "mex", "2026-06-24", "21:00", "group", "azteca", "A"),
  createMatch("a6", "rsa", "kor", "2026-06-24", "21:00", "group", "bbva", "A"),

  // ========== GRUPO B ==========
  // Rodada 1
  createMatch("b1", "can", "bih", "2026-06-12", "15:00", "group", "bmo", "B"),
  createMatch("b2", "qat", "sui", "2026-06-12", "18:00", "group", "lumen", "B"),
  // Rodada 2
  createMatch("b3", "can", "qat", "2026-06-18", "21:00", "group", "bcplace", "B"),
  createMatch("b4", "bih", "sui", "2026-06-19", "15:00", "group", "bmo", "B"),
  // Rodada 3
  createMatch("b5", "sui", "can", "2026-06-24", "15:00", "group", "bcplace", "B"),
  createMatch("b6", "bih", "qat", "2026-06-24", "15:00", "group", "lumen", "B"),

  // ========== GRUPO C ==========
  // Rodada 1
  createMatch("c1", "bra", "mar", "2026-06-13", "18:00", "group", "metlife", "C"),
  createMatch("c2", "hai", "sco", "2026-06-13", "12:00", "group", "gillette", "C"),
  // Rodada 2
  createMatch("c3", "bra", "hai", "2026-06-19", "18:00", "group", "metlife", "C"),
  createMatch("c4", "mar", "sco", "2026-06-19", "21:00", "group", "gillette", "C"),
  // Rodada 3
  createMatch("c5", "sco", "bra", "2026-06-25", "18:00", "group", "metlife", "C"),
  createMatch("c6", "mar", "hai", "2026-06-25", "18:00", "group", "gillette", "C"),

  // ========== GRUPO D ==========
  // Rodada 1
  createMatch("d1", "usa", "par", "2026-06-12", "21:00", "group", "sofi", "D"),
  createMatch("d2", "aus", "tur", "2026-06-13", "15:00", "group", "levis", "D"),
  // Rodada 2
  createMatch("d3", "usa", "aus", "2026-06-19", "12:00", "group", "sofi", "D"),
  createMatch("d4", "par", "tur", "2026-06-20", "18:00", "group", "levis", "D"),
  // Rodada 3
  createMatch("d5", "tur", "usa", "2026-06-25", "21:00", "group", "sofi", "D"),
  createMatch("d6", "par", "aus", "2026-06-25", "21:00", "group", "levis", "D"),

  // ========== GRUPO E ==========
  // Rodada 1
  createMatch("e1", "ger", "cuw", "2026-06-14", "13:00", "group", "nrg", "E"),
  createMatch("e2", "civ", "ecu", "2026-06-14", "19:00", "group", "att", "E"),
  // Rodada 2
  createMatch("e3", "ger", "civ", "2026-06-20", "15:00", "group", "nrg", "E"),
  createMatch("e4", "cuw", "ecu", "2026-06-20", "12:00", "group", "att", "E"),
  // Rodada 3
  createMatch("e5", "ecu", "ger", "2026-06-26", "18:00", "group", "nrg", "E"),
  createMatch("e6", "cuw", "civ", "2026-06-26", "18:00", "group", "att", "E"),

  // ========== GRUPO F ==========
  // Rodada 1
  createMatch("f1", "ned", "jpn", "2026-06-14", "16:00", "group", "att", "F"),
  createMatch("f2", "swe", "tun", "2026-06-15", "15:00", "group", "arrowhead", "F"),
  // Rodada 2
  createMatch("f3", "ned", "swe", "2026-06-21", "15:00", "group", "att", "F"),
  createMatch("f4", "jpn", "tun", "2026-06-21", "18:00", "group", "arrowhead", "F"),
  // Rodada 3
  createMatch("f5", "tun", "ned", "2026-06-27", "18:00", "group", "att", "F"),
  createMatch("f6", "jpn", "swe", "2026-06-27", "18:00", "group", "arrowhead", "F"),

  // ========== GRUPO G ==========
  // Rodada 1
  createMatch("g1", "bel", "egy", "2026-06-15", "12:00", "group", "hardrock", "G"),
  createMatch("g2", "irn", "nzl", "2026-06-15", "18:00", "group", "lincoln", "G"),
  // Rodada 2
  createMatch("g3", "bel", "irn", "2026-06-21", "21:00", "group", "hardrock", "G"),
  createMatch("g4", "egy", "nzl", "2026-06-22", "12:00", "group", "lincoln", "G"),
  // Rodada 3
  createMatch("g5", "nzl", "bel", "2026-06-27", "21:00", "group", "hardrock", "G"),
  createMatch("g6", "egy", "irn", "2026-06-27", "21:00", "group", "lincoln", "G"),

  // ========== GRUPO H ==========
  // Rodada 1
  createMatch("h1", "esp", "cpv", "2026-06-15", "12:00", "group", "mercedes", "H"),
  createMatch("h2", "ksa", "uru", "2026-06-15", "18:00", "group", "hardrock", "H"),
  // Rodada 2
  createMatch("h3", "esp", "ksa", "2026-06-21", "12:00", "group", "mercedes", "H"),
  createMatch("h4", "uru", "cpv", "2026-06-21", "18:00", "group", "hardrock", "H"),
  // Rodada 3
  createMatch("h5", "cpv", "ksa", "2026-06-26", "20:00", "group", "nrg", "H"),
  createMatch("h6", "uru", "esp", "2026-06-26", "20:00", "group", "akron", "H"),

  // ========== GRUPO I ==========
  // Rodada 1
  createMatch("i1", "fra", "sen", "2026-06-16", "15:00", "group", "metlife", "I"),
  createMatch("i2", "irq", "nor", "2026-06-16", "18:00", "group", "gillette", "I"),
  // Rodada 2
  createMatch("i3", "fra", "irq", "2026-06-22", "15:00", "group", "metlife", "I"),
  createMatch("i4", "sen", "nor", "2026-06-22", "18:00", "group", "gillette", "I"),
  // Rodada 3
  createMatch("i5", "nor", "fra", "2026-06-26", "21:00", "group", "metlife", "I"),
  createMatch("i6", "sen", "irq", "2026-06-26", "21:00", "group", "gillette", "I"),

  // ========== GRUPO J ==========
  // Rodada 1
  createMatch("j1", "arg", "alg", "2026-06-16", "21:00", "group", "hardrock", "J"),
  createMatch("j2", "aut", "jor", "2026-06-17", "12:00", "group", "lincoln", "J"),
  // Rodada 2
  createMatch("j3", "arg", "aut", "2026-06-22", "21:00", "group", "hardrock", "J"),
  createMatch("j4", "alg", "jor", "2026-06-23", "12:00", "group", "lincoln", "J"),
  // Rodada 3
  createMatch("j5", "jor", "arg", "2026-06-27", "15:00", "group", "hardrock", "J"),
  createMatch("j6", "alg", "aut", "2026-06-27", "15:00", "group", "lincoln", "J"),

  // ========== GRUPO K ==========
  // Rodada 1
  createMatch("k1", "por", "cod", "2026-06-17", "15:00", "group", "sofi", "K"),
  createMatch("k2", "uzb", "col", "2026-06-17", "18:00", "group", "levis", "K"),
  // Rodada 2
  createMatch("k3", "por", "uzb", "2026-06-23", "15:00", "group", "sofi", "K"),
  createMatch("k4", "cod", "col", "2026-06-23", "18:00", "group", "levis", "K"),
  // Rodada 3
  createMatch("k5", "col", "por", "2026-06-27", "18:00", "group", "sofi", "K"),
  createMatch("k6", "cod", "uzb", "2026-06-27", "18:00", "group", "levis", "K"),

  // ========== GRUPO L ==========
  // Rodada 1
  createMatch("l1", "eng", "cro", "2026-06-17", "21:00", "group", "bmo", "L"),
  createMatch("l2", "gha", "pan", "2026-06-18", "15:00", "group", "bcplace", "L"),
  // Rodada 2
  createMatch("l3", "eng", "gha", "2026-06-23", "21:00", "group", "bmo", "L"),
  createMatch("l4", "cro", "pan", "2026-06-24", "12:00", "group", "bcplace", "L"),
  // Rodada 3
  createMatch("l5", "pan", "eng", "2026-06-27", "21:00", "group", "bmo", "L"),
  createMatch("l6", "cro", "gha", "2026-06-27", "21:00", "group", "bcplace", "L"),

  // ========== OITAVAS DE FINAL (Round of 32) ==========
  createMatch("r32-1", "mex", "sui", "2026-06-28", "13:00", "round16", "sofi"),
  createMatch("r32-2", "can", "cze", "2026-06-28", "16:00", "round16", "att"),
  createMatch("r32-3", "bra", "sco", "2026-06-28", "19:00", "round16", "metlife"),
  createMatch("r32-4", "usa", "tun", "2026-06-28", "22:00", "round16", "sofi"),
  createMatch("r32-5", "ger", "ecu", "2026-06-29", "13:00", "round16", "nrg"),
  createMatch("r32-6", "ned", "cuw", "2026-06-29", "16:00", "round16", "att"),
  createMatch("r32-7", "bel", "nzl", "2026-06-29", "19:00", "round16", "hardrock"),
  createMatch("r32-8", "esp", "uru", "2026-06-29", "22:00", "round16", "akron"),
  createMatch("r32-9", "fra", "nor", "2026-06-30", "13:00", "round16", "metlife"),
  createMatch("r32-10", "arg", "jor", "2026-06-30", "16:00", "round16", "hardrock"),
  createMatch("r32-11", "por", "col", "2026-06-30", "19:00", "round16", "sofi"),
  createMatch("r32-12", "eng", "pan", "2026-06-30", "22:00", "round16", "bmo"),
  createMatch("r32-13", "mar", "hai", "2026-07-01", "13:00", "round16", "gillette"),
  createMatch("r32-14", "kor", "rsa", "2026-07-01", "16:00", "round16", "mercedes"),
  createMatch("r32-15", "jpn", "swe", "2026-07-01", "19:00", "round16", "arrowhead"),
  createMatch("r32-16", "cro", "gha", "2026-07-01", "22:00", "round16", "bcplace"),

  // ========== OITAVAS DE FINAL (Round of 16) ==========
  createMatch("r16-1", "mex", "bra", "2026-07-04", "13:00", "round16", "metlife"),
  createMatch("r16-2", "usa", "ger", "2026-07-04", "16:00", "round16", "att"),
  createMatch("r16-3", "ned", "bel", "2026-07-04", "19:00", "round16", "hardrock"),
  createMatch("r16-4", "esp", "fra", "2026-07-04", "22:00", "round16", "sofi"),
  createMatch("r16-5", "arg", "por", "2026-07-05", "13:00", "round16", "metlife"),
  createMatch("r16-6", "eng", "mar", "2026-07-05", "16:00", "round16", "gillette"),
  createMatch("r16-7", "jpn", "cro", "2026-07-05", "19:00", "round16", "arrowhead"),
  createMatch("r16-8", "can", "kor", "2026-07-05", "22:00", "round16", "bcplace"),

  // ========== QUARTAS DE FINAL ==========
  createMatch("qf-1", "mex", "usa", "2026-07-10", "13:00", "quarter", "gillette"),
  createMatch("qf-2", "ned", "esp", "2026-07-10", "19:00", "quarter", "hardrock"),
  createMatch("qf-3", "arg", "eng", "2026-07-11", "13:00", "quarter", "att"),
  createMatch("qf-4", "jpn", "can", "2026-07-11", "19:00", "quarter", "arrowhead"),

  // ========== SEMIFINAIS ==========
  createMatch("sf-1", "mex", "ned", "2026-07-14", "18:00", "semi", "att"),
  createMatch("sf-2", "arg", "jpn", "2026-07-15", "18:00", "semi", "metlife"),

  // ========== TERCEIRO LUGAR ==========
  createMatch("third", "ned", "jpn", "2026-07-18", "17:00", "third", "hardrock"),

  // ========== FINAL ==========
  createMatch("final", "mex", "arg", "2026-07-19", "15:00", "final", "metlife"),
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getMatchById(id: string): Match | undefined {
  return matches.find((m) => m.id === id);
}

export function getMatchesByStage(stage: Match["stage"]): Match[] {
  return matches.filter((m) => m.stage === stage);
}

export function getMatchesByGroup(group: string): Match[] {
  return matches.filter((m) => m.group === group);
}

export function getMatchesByDate(date: Date): Match[] {
  return matches.filter(
    (m) => m.date.toDateString() === date.toDateString()
  );
}

export function getUpcomingMatches(limit = 6): Match[] {
  const now = new Date();
  return matches
    .filter((m) => m.date > now)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, limit);
}

export function getTeamsByGroup(group: string): Team[] {
  const teamIds = groups[group as keyof typeof groups];
  if (!teamIds) return [];
  return teamIds.map((id) => getTeam(id));
}

export function getTeamById(id: string): Team | undefined {
  return teams.find((t) => t.id === id);
}
