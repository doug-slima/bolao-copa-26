// ============================================
// ESCUDOS OFICIAIS DAS SELEÇÕES - COPA 2026
// Fonte: FootyLogos.com (https://www.footylogos.com)
// ============================================

export const teamCrests: Record<string, string> = {
  // Grupo A
  MEX: "/crests/MEX.png",
  RSA: "/crests/RSA.png",
  KOR: "/crests/KOR.png",
  CZE: "/crests/CZE.png",
  
  // Grupo B
  CAN: "/crests/CAN.png",
  BIH: "/crests/BIH.svg",
  QAT: "/crests/QAT.svg",
  SUI: "/crests/SUI.png",
  
  // Grupo C
  BRA: "/crests/BRA.png",
  MAR: "/crests/MAR.png",
  HAI: "/crests/HAI.png",
  SCO: "/crests/SCO.png",
  
  // Grupo D
  USA: "/crests/USA.png",
  PAR: "/crests/PAR.png",
  AUS: "/crests/AUS.png",
  TUR: "/crests/TUR.png",
  
  // Grupo E
  GER: "/crests/GER.png",
  CUW: "/crests/CUW.png",
  CIV: "/crests/CIV.png",
  ECU: "/crests/ECU.png",
  
  // Grupo F
  NED: "/crests/NED.png",
  JPN: "/crests/JPN.png",
  SWE: "/crests/SWE.png",
  TUN: "/crests/TUN.png",
  
  // Grupo G
  BEL: "/crests/BEL.png",
  EGY: "/crests/EGY.png",
  IRN: "/crests/IRN.png",
  NZL: "/crests/NZL.png",
  
  // Grupo H
  ESP: "/crests/ESP.png",
  CPV: "/crests/CPV.png",
  KSA: "/crests/KSA.png",
  URU: "/crests/URU.png",
  
  // Grupo I
  FRA: "/crests/FRA.png",
  SEN: "/crests/SEN.png",
  IRQ: "/crests/IRQ.png",
  NOR: "/crests/NOR.svg",
  
  // Grupo J
  ARG: "/crests/ARG.png",
  ALG: "/crests/ALG.png",
  AUT: "/crests/AUT.svg",
  JOR: "/crests/JOR.png",
  
  // Grupo K
  POR: "/crests/POR.png",
  COD: "/crests/COD.svg",
  UZB: "/crests/UZB.png",
  COL: "/crests/COL.svg",
  
  // Grupo L
  ENG: "/crests/ENG.png",
  CRO: "/crests/CRO.svg",
  GHA: "/crests/GHA.png",
  PAN: "/crests/PAN.svg",
};

export function getTeamCrest(tla: string): string | undefined {
  return teamCrests[tla.toUpperCase()];
}

export function getTeamCrestOrFallback(tla: string, fallbackUrl?: string): string {
  return teamCrests[tla.toUpperCase()] || fallbackUrl || "";
}
