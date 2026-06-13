"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/theme-context";
import { countryThemes } from "@/lib/themes";

interface ThemeSelectorProps {
  className?: string;
}

export function ThemeSelector({ className }: ThemeSelectorProps) {
  const { colorMode, setColorMode, countryTheme, setCountryTheme } = useTheme();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Color Mode */}
      <div>
        <h4 className="text-sm font-medium mb-3">Modo de cor</h4>
        <div className="flex items-center bg-muted rounded-lg p-1">
          <button
            onClick={() => setColorMode("light")}
            className={cn(
              "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2",
              colorMode === "light"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
            Claro
          </button>
          <button
            onClick={() => setColorMode("dark")}
            className={cn(
              "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2",
              colorMode === "dark"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
            Escuro
          </button>
          <button
            onClick={() => setColorMode("system")}
            className={cn(
              "flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center gap-2",
              colorMode === "system"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
            Sistema
          </button>
        </div>
      </div>

      {/* Country Theme */}
      <div>
        <h4 className="text-sm font-medium mb-3">Tema do país</h4>
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {countryThemes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => setCountryTheme(theme.id)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all",
                countryTheme.id === theme.id
                  ? "bg-secondary ring-2 ring-foreground ring-offset-2 ring-offset-background"
                  : "bg-muted/50 hover:bg-muted"
              )}
            >
              <span className="text-2xl">{theme.flag}</span>
              <span className="text-[10px] font-medium text-muted-foreground truncate w-full text-center">
                {theme.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div>
        <h4 className="text-sm font-medium mb-3">Preview</h4>
        <div className="flex items-center gap-2">
          <div
            className="w-12 h-12 rounded-xl"
            style={{ backgroundColor: countryTheme.colors.primary }}
          />
          <div
            className="w-12 h-12 rounded-xl"
            style={{ backgroundColor: countryTheme.colors.secondary }}
          />
          <div
            className="w-12 h-12 rounded-xl"
            style={{ backgroundColor: countryTheme.colors.accent }}
          />
        </div>
      </div>
    </div>
  );
}
