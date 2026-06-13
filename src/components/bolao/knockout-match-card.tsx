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
        "bg-card rounded-2xl p-4 border border-border/50",
        "hover:border-border hover:shadow-xl transition-all duration-200",
        "cursor-pointer group",
        isLive && "border-green-500/50 bg-green-500/5",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
            Jogo {definition.matchNumber}
          </span>
          {definition.stage === "final" && (
            <span className="bg-yellow-500 text-yellow-950 text-xs font-bold px-2 py-1 rounded">
              FINAL
            </span>
          )}
          {definition.stage === "third" && (
            <span className="bg-orange-500 text-orange-950 text-xs font-bold px-2 py-1 rounded">
              3º LUGAR
            </span>
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {formattedDate} • {formattedTime}
        </span>
        {isLive && (
          <span className="flex items-center gap-1 text-xs text-green-500">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            AO VIVO
          </span>
        )}
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between gap-4">
        {/* Home Team */}
        <div className="flex-1 flex items-center gap-3">
          {hasTeams && actualMatch?.homeTeam ? (
            <>
              <TeamFlag flag={actualMatch.homeTeam.flag} name={actualMatch.homeTeam.name} size="lg" />
              <div className="min-w-0">
                <p className="font-medium truncate">{actualMatch.homeTeam.name}</p>
                <p className="text-xs text-muted-foreground">{actualMatch.homeTeam.code}</p>
              </div>
            </>
          ) : (
            <>
              <PlaceholderFlag />
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground truncate">{definition.homeTeamLabel}</p>
              </div>
            </>
          )}
        </div>

        {/* Score or VS */}
        <div className="flex-shrink-0">
          {actualMatch?.score ? (
            <div className="flex items-center gap-2 bg-muted rounded-xl px-4 py-2">
              <span className="text-2xl font-bold tabular-nums">
                {actualMatch.score.home}
              </span>
              <span className="text-muted-foreground">-</span>
              <span className="text-2xl font-bold tabular-nums">
                {actualMatch.score.away}
              </span>
            </div>
          ) : (
            <div className="text-sm font-medium text-muted-foreground bg-muted rounded-xl px-4 py-2">
              vs
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex-1 flex items-center gap-3 justify-end">
          {hasTeams && actualMatch?.awayTeam ? (
            <>
              <div className="min-w-0 text-right">
                <p className="font-medium truncate">{actualMatch.awayTeam.name}</p>
                <p className="text-xs text-muted-foreground">{actualMatch.awayTeam.code}</p>
              </div>
              <TeamFlag flag={actualMatch.awayTeam.flag} name={actualMatch.awayTeam.name} size="lg" />
            </>
          ) : (
            <>
              <div className="min-w-0 text-right">
                <p className="text-sm text-muted-foreground truncate">{definition.awayTeamLabel}</p>
              </div>
              <PlaceholderFlag />
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-border/50">
        <p className="text-xs text-muted-foreground text-center">
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
        "flex items-center justify-center bg-muted shadow-sm shrink-0",
        "w-14 h-14 rounded-lg"
      )}
    >
      <span className="text-2xl text-muted-foreground font-bold">?</span>
    </div>
  );
}
