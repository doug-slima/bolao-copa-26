"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Match } from "@/types";
import { KnockoutMatchDefinition } from "@/lib/knockout-structure";
import { TeamFlag } from "./team-flag";

interface KnockoutMatchCardProps {
  definition: KnockoutMatchDefinition;
  actualMatch?: Match;
  className?: string;
}

export function KnockoutMatchCard({
  definition,
  actualMatch,
  className,
}: KnockoutMatchCardProps) {
  const matchDate = new Date(`${definition.date}T${definition.time}:00`);

  const formattedTime = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(matchDate);

  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  }).format(matchDate);

  const hasTeams = actualMatch?.homeTeam?.name !== "A definir" && actualMatch?.awayTeam?.name !== "A definir";
  const isLive = actualMatch?.status === "live";
  const isFinished = actualMatch?.status === "finished";

  const content = (
    <div
      className={cn(
        "bg-card rounded-2xl p-3 sm:p-4 border border-border/50",
        "hover:border-border hover:shadow-xl transition-all duration-200",
        "cursor-pointer group",
        isLive && "border-green-500/50 bg-green-500/5",
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="bg-primary text-primary-foreground text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg">
            Jogo {definition.matchNumber}
          </span>
          {definition.stage === "final" && (
            <span className="bg-yellow-500 text-yellow-950 text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg">
              FINAL
            </span>
          )}
          {definition.stage === "third" && (
            <span className="bg-orange-500 text-orange-950 text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg">
              3º LUGAR
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] sm:text-xs text-muted-foreground">
            {formattedDate} • {formattedTime}
          </span>
          {isLive && (
            <span className="flex items-center gap-1 text-[10px] sm:text-xs text-green-500">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              AO VIVO
            </span>
          )}
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Home Team */}
        <div className="flex-1 flex items-center gap-2 sm:gap-3 min-w-0">
          {hasTeams && actualMatch?.homeTeam ? (
            <>
              <div className="shrink-0">
                <TeamFlag flag={actualMatch.homeTeam.flag} name={actualMatch.homeTeam.name} size="md" className="sm:hidden" />
                <TeamFlag flag={actualMatch.homeTeam.flag} name={actualMatch.homeTeam.name} size="lg" className="hidden sm:flex" />
              </div>
              <div className="min-w-0">
                <p className="font-medium truncate text-sm sm:text-base">{actualMatch.homeTeam.name}</p>
                <p className="text-xs text-muted-foreground hidden sm:block">{actualMatch.homeTeam.code}</p>
              </div>
            </>
          ) : (
            <>
              <PlaceholderFlag />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{definition.homeTeamLabel}</p>
              </div>
            </>
          )}
        </div>

        {/* Score or VS */}
        <div className="shrink-0">
          {actualMatch?.score ? (
            <div className="flex items-center gap-1.5 sm:gap-2 bg-muted rounded-xl px-3 sm:px-4 py-1.5 sm:py-2">
              <span className="text-xl sm:text-2xl font-bold tabular-nums">
                {actualMatch.score.home}
              </span>
              <span className="text-muted-foreground">-</span>
              <span className="text-xl sm:text-2xl font-bold tabular-nums">
                {actualMatch.score.away}
              </span>
            </div>
          ) : (
            <div className="text-sm font-medium text-muted-foreground bg-muted rounded-xl px-3 sm:px-4 py-1.5 sm:py-2">
              vs
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex-1 flex items-center gap-2 sm:gap-3 justify-end min-w-0">
          {hasTeams && actualMatch?.awayTeam ? (
            <>
              <div className="min-w-0 text-right">
                <p className="font-medium truncate text-sm sm:text-base">{actualMatch.awayTeam.name}</p>
                <p className="text-xs text-muted-foreground hidden sm:block">{actualMatch.awayTeam.code}</p>
              </div>
              <div className="shrink-0">
                <TeamFlag flag={actualMatch.awayTeam.flag} name={actualMatch.awayTeam.name} size="md" className="sm:hidden" />
                <TeamFlag flag={actualMatch.awayTeam.flag} name={actualMatch.awayTeam.name} size="lg" className="hidden sm:flex" />
              </div>
            </>
          ) : (
            <>
              <div className="min-w-0 text-right">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{definition.awayTeamLabel}</p>
              </div>
              <PlaceholderFlag />
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-border/50">
        <p className="text-[10px] sm:text-xs text-muted-foreground text-center truncate">
          {definition.venue} • {definition.city}
        </p>
      </div>
    </div>
  );

  if (actualMatch) {
    return <Link href={`/jogos/${actualMatch.id}`}>{content}</Link>;
  }

  return content;
}

function PlaceholderFlag() {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-muted shadow-sm shrink-0 rounded-lg",
        "w-12 h-12 sm:w-14 sm:h-14"
      )}
    >
      <span className="text-xl sm:text-2xl text-muted-foreground font-bold">?</span>
    </div>
  );
}
