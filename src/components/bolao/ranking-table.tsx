"use client";

import { cn } from "@/lib/utils";
import type { UserRankingExtended, RankingMovement } from "@/types";
import { ArrowUp, ArrowDown, Minus, Sparkle } from "@phosphor-icons/react";

interface RankingTableProps {
  rankings: UserRankingExtended[];
  currentUserId?: string;
  compact?: boolean;
  className?: string;
}

function PositionBadge({ position }: { position: number }) {
  if (position === 1) {
    return (
      <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center font-bold text-sm">
        1
      </div>
    );
  }
  if (position === 2) {
    return (
      <div className="w-8 h-8 rounded-full bg-zinc-400/20 text-zinc-400 flex items-center justify-center font-bold text-sm">
        2
      </div>
    );
  }
  if (position === 3) {
    return (
      <div className="w-8 h-8 rounded-full bg-amber-700/20 text-amber-700 dark:text-amber-600 flex items-center justify-center font-bold text-sm">
        3
      </div>
    );
  }
  return (
    <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-medium text-sm">
      {position}
    </div>
  );
}

function MovementIndicator({
  movement,
  change,
}: {
  movement: RankingMovement;
  change: number;
}) {
  if (movement === "new") {
    return (
      <div className="flex items-center gap-0.5 text-blue-500">
        <Sparkle size={14} weight="fill" />
        <span className="text-[10px] font-medium">NEW</span>
      </div>
    );
  }

  if (movement === "up") {
    return (
      <div className="flex items-center gap-0.5 text-green-500">
        <ArrowUp size={14} weight="bold" />
        <span className="text-[10px] font-medium">{change}</span>
      </div>
    );
  }

  if (movement === "down") {
    return (
      <div className="flex items-center gap-0.5 text-red-500">
        <ArrowDown size={14} weight="bold" />
        <span className="text-[10px] font-medium">{change}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center text-muted-foreground">
      <Minus size={14} weight="bold" />
    </div>
  );
}

export function RankingTable({
  rankings,
  currentUserId,
  compact = false,
  className,
}: RankingTableProps) {
  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        {rankings.slice(0, 5).map((user) => (
          <div
            key={user.userId}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl",
              user.userId === currentUserId
                ? "bg-primary/10 ring-1 ring-primary/30"
                : "hover:bg-secondary/50 transition-colors"
            )}
          >
            <PositionBadge position={user.position} />
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{user.userName}</p>
            </div>
            <MovementIndicator
              movement={user.movement}
              change={user.positionChange}
            />
            <span className="font-bold tabular-nums">{user.totalPoints} pts</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("bg-card rounded-2xl border border-border/50", className)}>
      {/* Mobile Layout */}
      <div className="md:hidden divide-y divide-border/50">
        {rankings.map((user) => (
          <div
            key={user.userId}
            className={cn(
              "p-3 transition-colors",
              user.userId === currentUserId
                ? "bg-primary/10 ring-1 ring-inset ring-primary/30"
                : "hover:bg-secondary/50"
            )}
          >
            <div className="flex items-center gap-3">
              <PositionBadge position={user.position} />
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.userName}
                  className="w-8 h-8 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium text-sm shrink-0">
                  {user.userName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-sm">{user.userName}</p>
                <p className="text-xs text-muted-foreground">
                  {user.totalPredictions} palpites
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <MovementIndicator
                  movement={user.movement}
                  change={user.positionChange}
                />
                <span className="text-base font-bold tabular-nums">
                  {user.totalPoints}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        {/* Header */}
        <div className="grid grid-cols-12 gap-2 p-4 border-b border-border/50 text-xs font-medium text-muted-foreground">
          <div className="col-span-1">#</div>
          <div className="col-span-4">Jogador</div>
          <div className="col-span-1 text-center"></div>
          <div className="col-span-2 text-center">Exatos</div>
          <div className="col-span-2 text-center">Desafios</div>
          <div className="col-span-2 text-right">Pontos</div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-border/50">
          {rankings.map((user) => (
            <div
              key={user.userId}
              className={cn(
                "grid grid-cols-12 gap-2 p-4 items-center transition-colors",
                user.userId === currentUserId
                  ? "bg-primary/10 ring-1 ring-inset ring-primary/30"
                  : "hover:bg-secondary/50"
              )}
            >
              <div className="col-span-1">
                <PositionBadge position={user.position} />
              </div>
              <div className="col-span-4 flex items-center gap-3">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.userName}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium">
                    {user.userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-medium truncate">{user.userName}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.totalPredictions} palpites
                  </p>
                </div>
              </div>
              <div className="col-span-1 flex justify-center">
                <MovementIndicator
                  movement={user.movement}
                  change={user.positionChange}
                />
              </div>
              <div className="col-span-2 text-center">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-500 rounded-lg text-sm font-medium">
                  {user.exactPredictions}
                </span>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-sm">
                  <span className="text-green-500 font-medium">{user.challengeWins}W</span>
                  <span className="text-muted-foreground mx-1">-</span>
                  <span className="text-red-500 font-medium">{user.challengeLosses}L</span>
                </span>
              </div>
              <div className="col-span-2 text-right">
                <span className="text-lg font-bold tabular-nums">
                  {user.totalPoints}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
