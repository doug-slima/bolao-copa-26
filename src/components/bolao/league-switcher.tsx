"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
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
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScrollPosition = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const hasOverflow = scrollWidth > clientWidth;
    
    setShowLeftArrow(hasOverflow && scrollLeft > 5);
    setShowRightArrow(hasOverflow && scrollLeft < scrollWidth - clientWidth - 5);
  }, []);

  useEffect(() => {
    checkScrollPosition();
    window.addEventListener("resize", checkScrollPosition);
    return () => window.removeEventListener("resize", checkScrollPosition);
  }, [checkScrollPosition, leagues]);

  useEffect(() => {
    const selectedButton = scrollRef.current?.querySelector(`[data-id="${selectedId}"]`);
    if (selectedButton) {
      selectedButton.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [selectedId]);

  const scrollBy = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;
    
    const scrollAmount = container.clientWidth * 0.7;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

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
    <div className={cn("relative flex items-center max-w-full", className)}>
      {/* Left Arrow */}
      <div
        className={cn(
          "absolute left-0 z-10 flex items-center transition-opacity duration-200",
          showLeftArrow ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-background to-transparent pointer-events-none" />
        <button
          onClick={() => scrollBy("left")}
          className="relative z-10 w-8 h-8 flex items-center justify-center bg-background/90 backdrop-blur-sm border border-border/50 rounded-full shadow-md hover:bg-muted transition-colors"
          aria-label="Scroll left"
        >
          <CaretLeft size={16} weight="bold" />
        </button>
      </div>

      {/* Scrollable Container */}
      <div
        ref={scrollRef}
        onScroll={checkScrollPosition}
        className={cn(
          "flex gap-2 overflow-x-auto scroll-smooth px-1 py-1",
          "scrollbar-hide",
          showLeftArrow && "pl-10",
          showRightArrow && "pr-10"
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

      {/* Right Arrow */}
      <div
        className={cn(
          "absolute right-0 z-10 flex items-center transition-opacity duration-200",
          showRightArrow ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        <button
          onClick={() => scrollBy("right")}
          className="relative z-10 w-8 h-8 flex items-center justify-center bg-background/90 backdrop-blur-sm border border-border/50 rounded-full shadow-md hover:bg-muted transition-colors"
          aria-label="Scroll right"
        >
          <CaretRight size={16} weight="bold" />
        </button>
      </div>
    </div>
  );
}
