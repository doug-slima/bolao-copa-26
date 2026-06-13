// ============================================
// SISTEMA DE TEMAS - BOLÃO COPA 26
// Dark/Light mode + Temas por País
// ============================================

export interface CountryTheme {
  id: string;
  name: string;
  flag: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export const countryThemes: CountryTheme[] = [
  {
    id: "default",
    name: "Padrão",
    flag: "⚽",
    colors: {
      primary: "#3b82f6",    // Blue
      secondary: "#1e40af",
      accent: "#60a5fa",
    },
  },
  {
    id: "bra",
    name: "Brasil",
    flag: "🇧🇷",
    colors: {
      primary: "#009739",    // Verde
      secondary: "#FEDD00",  // Amarelo
      accent: "#002776",     // Azul
    },
  },
  {
    id: "arg",
    name: "Argentina",
    flag: "🇦🇷",
    colors: {
      primary: "#75AADB",    // Azul celeste
      secondary: "#FFFFFF",
      accent: "#F6B40E",     // Sol
    },
  },
  {
    id: "mex",
    name: "México",
    flag: "🇲🇽",
    colors: {
      primary: "#006341",    // Verde
      secondary: "#FFFFFF",
      accent: "#CE1126",     // Vermelho
    },
  },
  {
    id: "usa",
    name: "Estados Unidos",
    flag: "🇺🇸",
    colors: {
      primary: "#002868",    // Azul
      secondary: "#FFFFFF",
      accent: "#BF0A30",     // Vermelho
    },
  },
  {
    id: "ger",
    name: "Alemanha",
    flag: "🇩🇪",
    colors: {
      primary: "#000000",    // Preto
      secondary: "#DD0000",  // Vermelho
      accent: "#FFCC00",     // Dourado
    },
  },
  {
    id: "fra",
    name: "França",
    flag: "🇫🇷",
    colors: {
      primary: "#002395",    // Azul
      secondary: "#FFFFFF",
      accent: "#ED2939",     // Vermelho
    },
  },
  {
    id: "esp",
    name: "Espanha",
    flag: "🇪🇸",
    colors: {
      primary: "#AA151B",    // Vermelho
      secondary: "#F1BF00",  // Amarelo
      accent: "#AA151B",
    },
  },
  {
    id: "por",
    name: "Portugal",
    flag: "🇵🇹",
    colors: {
      primary: "#006600",    // Verde
      secondary: "#FF0000",  // Vermelho
      accent: "#FFD700",     // Dourado
    },
  },
  {
    id: "eng",
    name: "Inglaterra",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    colors: {
      primary: "#FFFFFF",
      secondary: "#CF081F",  // Vermelho
      accent: "#002366",     // Azul
    },
  },
  {
    id: "ned",
    name: "Holanda",
    flag: "🇳🇱",
    colors: {
      primary: "#FF6600",    // Laranja
      secondary: "#FFFFFF",
      accent: "#21468B",     // Azul
    },
  },
  {
    id: "bel",
    name: "Bélgica",
    flag: "🇧🇪",
    colors: {
      primary: "#ED2939",    // Vermelho
      secondary: "#FAE042",  // Amarelo
      accent: "#000000",     // Preto
    },
  },
  {
    id: "jpn",
    name: "Japão",
    flag: "🇯🇵",
    colors: {
      primary: "#BC002D",    // Vermelho
      secondary: "#FFFFFF",
      accent: "#000080",     // Navy
    },
  },
  {
    id: "kor",
    name: "Coreia do Sul",
    flag: "🇰🇷",
    colors: {
      primary: "#CD2E3A",    // Vermelho
      secondary: "#FFFFFF",
      accent: "#0047A0",     // Azul
    },
  },
  {
    id: "col",
    name: "Colômbia",
    flag: "🇨🇴",
    colors: {
      primary: "#FCD116",    // Amarelo
      secondary: "#003893",  // Azul
      accent: "#CE1126",     // Vermelho
    },
  },
  {
    id: "uru",
    name: "Uruguai",
    flag: "🇺🇾",
    colors: {
      primary: "#5BCEFA",    // Azul celeste
      secondary: "#FFFFFF",
      accent: "#F5A623",     // Sol
    },
  },
];

export function getThemeById(id: string): CountryTheme | undefined {
  return countryThemes.find((t) => t.id === id);
}

export function getThemeCSSVariables(theme: CountryTheme): Record<string, string> {
  return {
    "--theme-primary": theme.colors.primary,
    "--theme-secondary": theme.colors.secondary,
    "--theme-accent": theme.colors.accent,
  };
}
