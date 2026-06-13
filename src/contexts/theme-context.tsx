"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { CountryTheme, countryThemes, getThemeById } from "@/lib/themes";

type ColorMode = "light" | "dark" | "system";

interface ThemeContextType {
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  countryTheme: CountryTheme;
  setCountryTheme: (themeId: string) => void;
  resolvedColorMode: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [colorMode, setColorMode] = useState<ColorMode>("dark");
  const [countryTheme, setCountryThemeState] = useState<CountryTheme>(
    countryThemes[0]
  );
  const [resolvedColorMode, setResolvedColorMode] = useState<"light" | "dark">(
    "dark"
  );

  // Load saved preferences on mount
  useEffect(() => {
    const savedColorMode = localStorage.getItem("colorMode") as ColorMode;
    const savedCountryTheme = localStorage.getItem("countryTheme");

    if (savedColorMode) {
      setColorMode(savedColorMode);
    }

    if (savedCountryTheme) {
      const theme = getThemeById(savedCountryTheme);
      if (theme) {
        setCountryThemeState(theme);
      }
    }
  }, []);

  // Handle color mode changes
  useEffect(() => {
    const root = document.documentElement;

    const updateColorMode = () => {
      let resolved: "light" | "dark" = "dark";

      if (colorMode === "system") {
        resolved = window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      } else {
        resolved = colorMode;
      }

      setResolvedColorMode(resolved);

      if (resolved === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    updateColorMode();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (colorMode === "system") {
        updateColorMode();
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [colorMode]);

  // Apply country theme CSS variables
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--theme-primary", countryTheme.colors.primary);
    root.style.setProperty("--theme-secondary", countryTheme.colors.secondary);
    root.style.setProperty("--theme-accent", countryTheme.colors.accent);
  }, [countryTheme]);

  const handleSetColorMode = (mode: ColorMode) => {
    setColorMode(mode);
    localStorage.setItem("colorMode", mode);
  };

  const handleSetCountryTheme = (themeId: string) => {
    const theme = getThemeById(themeId);
    if (theme) {
      setCountryThemeState(theme);
      localStorage.setItem("countryTheme", themeId);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        colorMode,
        setColorMode: handleSetColorMode,
        countryTheme,
        setCountryTheme: handleSetCountryTheme,
        resolvedColorMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
