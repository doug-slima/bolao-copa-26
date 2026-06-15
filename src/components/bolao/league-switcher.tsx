"use client";

import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface LeagueSwitcherProps {
  leagues: Array<{ id: string; name: string }>;
  selectedId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function LeagueSwitcher({
  leagues,
  selectedId,
  onChange,
  className,
}: LeagueSwitcherProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selectedButton = scrollRef.current?.querySelector(`[data-id="${selectedId}"]`);
    if (selectedButton) {
      selectedButton.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [selectedId]);

  if (leagues.length === 0) return null;

  if (leagues.length === 1) {
    return (
      <div className={cn("flex justify-center", className)}>
        <span className="px-4 py-2 bg-foreground text-background rounded-full text-sm font-medium">
          {leagues[0].name}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("relative max-w-full", className)}>
      <div
        ref={scrollRef}
        className={cn(
          "flex gap-2 overflow-x-auto scroll-smooth px-1 py-1",
          "scrollbar-hide"
        )}
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {leagues.map((league) => (
          <button
            key={league.id}
            data-id={league.id}
            onClick={() => onChange(league.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all shrink-0",
              selectedId === league.id
                ? "bg-foreground text-background shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
            )}
          >
            {league.name}
          </button>
        ))}
      </div>
    </div>
  );
}
