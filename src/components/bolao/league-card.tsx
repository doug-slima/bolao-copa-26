"use client";

import type { League } from "@/types";
import { Users, Crown, Trophy } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface LeagueCardProps {
  league: League;
  userPosition?: number | null;
  onClick?: () => void;
  className?: string;
}

export function LeagueCard({
  league,
  userPosition,
  onClick,
  className,
}: LeagueCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left bg-card border border-border/50 rounded-2xl p-5 transition-all",
        "hover:border-border hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{league.name}</h3>
          {league.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {league.description}
            </p>
          )}
        </div>

        {userPosition && (
          <div
            className={cn(
              "shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium",
              userPosition === 1
                ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                : userPosition === 2
                  ? "bg-zinc-300/30 text-zinc-600 dark:text-zinc-400"
                  : userPosition === 3
                    ? "bg-amber-600/20 text-amber-700 dark:text-amber-500"
                    : "bg-muted text-muted-foreground"
            )}
          >
            {userPosition <= 3 ? (
              <Trophy size={14} weight="fill" />
            ) : (
              <span>#</span>
            )}
            {userPosition}º
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Users size={16} />
          <span>{league.memberCount} membros</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Crown size={16} />
          <span>por {league.createdByName}</span>
        </div>
      </div>
    </button>
  );
}
