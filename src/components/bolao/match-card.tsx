"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatMatchTime, formatMatchDate, isBeforeDayBrazil, getNowBrazil } from "@/lib/date-utils";
import { Match } from "@/types";
import { TeamFlag } from "./team-flag";
import { YoutubeLogo, SneakerMove, Check } from "@phosphor-icons/react";

const CAZÉTV_LIVE_URL = "https://www.youtube.com/@CasimiroMiguel/live";

interface UserPrediction {
  homeScore: number;
  awayScore: number;
}

interface MatchCardProps {
  match: Match;
  showTime?: boolean;
  compact?: boolean;
  predictionCount?: number;
  userPrediction?: UserPrediction;
  className?: string;
}

export function MatchCard({
  match,
  showTime = true,
  compact = false,
  predictionCount,
  userPrediction,
  className,
}: MatchCardProps) {
  const router = useRouter();
  
  const handleCardClick = () => {
    router.push(`/jogos/${match.id}`);
  };
  const formattedTime = formatMatchTime(match.date);
  const formattedDate = formatMatchDate(match.date);
  const isPastMatch = isBeforeDayBrazil(match.date, getNowBrazil());

  if (compact) {
    return (
      <div
        onClick={handleCardClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
        className={cn(
          "bg-card rounded-xl p-3 border border-border/50",
          "hover:border-border hover:shadow-lg transition-all duration-200",
          "cursor-pointer",
          match.status === "live" && "border-green-500/50 bg-green-500/5",
          className
        )}
      >
          {(userPrediction || (predictionCount !== undefined && predictionCount > 0)) && (
            <div className="flex items-center justify-end mb-2">
              {userPrediction ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-600 rounded-full text-xs font-medium">
                  <Check size={10} weight="bold" />
                  {userPrediction.homeScore}-{userPrediction.awayScore}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                  <SneakerMove size={10} weight="bold" />
                  {predictionCount}
                </span>
              )}
            </div>
          )}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <TeamFlag flag={match.homeTeam.flag} name={match.homeTeam.name} size="sm" />
              <span className="text-sm font-medium truncate">
                {match.homeTeam.code}
              </span>
            </div>
            
            {match.status === "live" ? (
              <span className="flex items-center gap-1 text-xs text-green-500 px-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                AO VIVO
              </span>
            ) : isPastMatch ? (
              <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-lg">
                <span className="text-sm font-bold tabular-nums">
                  {match.score?.home ?? 0}
                </span>
                <span className="text-muted-foreground text-xs">-</span>
                <span className="text-sm font-bold tabular-nums">
                  {match.score?.away ?? 0}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-lg">
                <span className="text-sm font-bold tabular-nums text-muted-foreground">
                  ?
                </span>
                <span className="text-muted-foreground text-xs">-</span>
                <span className="text-sm font-bold tabular-nums text-muted-foreground">
                  ?
                </span>
              </div>
            )}
            
            <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
              <span className="text-sm font-medium truncate">
                {match.awayTeam.code}
              </span>
              <TeamFlag flag={match.awayTeam.flag} name={match.awayTeam.name} size="sm" />
            </div>
          </div>
          
          {/* Watch Live Button - Compact */}
          {match.status === "live" && (
            <a
              href={CAZÉTV_LIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "mt-2 w-full flex items-center justify-center gap-1.5",
                "bg-white hover:bg-gray-100 text-gray-900",
                "border border-gray-200",
                "rounded-full py-1.5 px-3 text-xs font-medium",
                "transition-colors duration-200"
              )}
            >
              <YoutubeLogo size={16} weight="fill" className="text-red-600" />
              <span>Assista ao vivo na <strong>CazéTV</strong></span>
            </a>
          )}
      </div>
    );
  }

  return (
    <div
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
      className={cn(
        "bg-card rounded-2xl p-4 border border-border/50",
        "hover:border-border hover:shadow-xl transition-all duration-200",
        "cursor-pointer group",
        match.status === "live" && "border-green-500/50 bg-green-500/5",
        className
      )}
    >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {match.group ? `Grupo ${match.group}` : match.stage}
            </span>
            {userPrediction ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/10 text-green-600 rounded-full text-xs font-medium">
                <Check size={12} weight="bold" />
                {userPrediction.homeScore}-{userPrediction.awayScore}
              </span>
            ) : predictionCount !== undefined && predictionCount > 0 ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs font-medium">
                <SneakerMove size={12} weight="bold" />
                {predictionCount}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {showTime && (
              <span className="text-xs text-muted-foreground">
                {formattedDate} • {formattedTime}
              </span>
            )}
            {match.status === "live" && (
              <span className="flex items-center gap-1 text-xs text-green-500">
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
            <div className="shrink-0">
              <TeamFlag flag={match.homeTeam.flag} name={match.homeTeam.name} size="md" className="sm:hidden" />
              <TeamFlag flag={match.homeTeam.flag} name={match.homeTeam.name} size="lg" className="hidden sm:block" />
            </div>
            <div className="min-w-0">
              <p className="font-medium truncate text-sm sm:text-base">{match.homeTeam.name}</p>
              <p className="text-xs text-muted-foreground hidden sm:block">{match.homeTeam.code}</p>
            </div>
          </div>

          {/* Score */}
          <div className="shrink-0">
            {isPastMatch || match.status === "live" ? (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-muted rounded-xl px-3 sm:px-4 py-1.5 sm:py-2">
                <span className="text-xl sm:text-2xl font-bold tabular-nums">
                  {match.score?.home ?? 0}
                </span>
                <span className="text-muted-foreground">-</span>
                <span className="text-xl sm:text-2xl font-bold tabular-nums">
                  {match.score?.away ?? 0}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2 bg-muted rounded-xl px-3 sm:px-4 py-1.5 sm:py-2">
                <span className="text-xl sm:text-2xl font-bold tabular-nums text-muted-foreground">
                  ?
                </span>
                <span className="text-muted-foreground">-</span>
                <span className="text-xl sm:text-2xl font-bold tabular-nums text-muted-foreground">
                  ?
                </span>
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex-1 flex items-center gap-2 sm:gap-3 justify-end min-w-0">
            <div className="min-w-0 text-right">
              <p className="font-medium truncate text-sm sm:text-base">{match.awayTeam.name}</p>
              <p className="text-xs text-muted-foreground hidden sm:block">{match.awayTeam.code}</p>
            </div>
            <div className="shrink-0">
              <TeamFlag flag={match.awayTeam.flag} name={match.awayTeam.name} size="md" className="sm:hidden" />
              <TeamFlag flag={match.awayTeam.flag} name={match.awayTeam.name} size="lg" className="hidden sm:block" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center">
            {match.venue && match.venue !== "A definir" 
              ? `${match.venue}${match.city ? ` • ${match.city}` : ""}`
              : isPastMatch 
                ? "Local não registrado" 
                : "Local a confirmar"}
          </p>
          
          {/* Watch Live Button */}
          {match.status === "live" && (
            <a
              href={CAZÉTV_LIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "mt-3 w-full flex items-center justify-center gap-2",
                "bg-white hover:bg-gray-100 text-gray-900",
                "border border-gray-200",
                "rounded-full py-2.5 px-4 text-sm font-medium",
                "transition-colors duration-200"
              )}
            >
              <YoutubeLogo size={20} weight="fill" className="text-red-600" />
              <span>Assista ao vivo na <strong>CazéTV</strong></span>
            </a>
          )}
        </div>
    </div>
  );
}
