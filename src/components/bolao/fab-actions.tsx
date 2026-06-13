"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { Plus, SneakerMove, Fire } from "@phosphor-icons/react";
import { MatchSelectorModal } from "./match-selector-modal";
import { ChallengeForm } from "./challenge-form";
import type { Match } from "@/types";

const actionItems = [
  {
    id: "chute",
    label: "Chute",
    icon: SneakerMove,
  },
  {
    id: "desafie",
    label: "Desafie",
    icon: Fire,
  },
];

export function FabActions() {
  const [open, setOpen] = useState(false);
  const [chuteModalOpen, setChuteModalOpen] = useState(false);
  const [desafioModalOpen, setDesafioModalOpen] = useState(false);
  const [matches, setMatches] = useState<Match[]>([]);
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadMatches() {
      try {
        const { getAllMatches } = await import("@/lib/api");
        const allMatches = await getAllMatches();
        setMatches(allMatches);
      } catch (error) {
        console.error("Failed to load matches for FAB:", error);
      }
    }

    if (isSignedIn) {
      loadMatches();
    }
  }, [isSignedIn]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const handleActionClick = (actionId: string) => {
    setOpen(false);
    
    if (actionId === "chute") {
      setChuteModalOpen(true);
    } else if (actionId === "desafie") {
      setDesafioModalOpen(true);
    }
  };

  if (!isSignedIn) return null;

  return (
    <>
      <div
        ref={containerRef}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      >
        {/* Dropdown menu */}
        <div
          className={cn(
            "absolute bottom-full left-1/2 -translate-x-1/2 mb-3 transition-all duration-200 origin-bottom",
            open
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-95 translate-y-2 pointer-events-none"
          )}
        >
          <div className="bg-background/80 backdrop-blur-xl border-2 border-border/50 rounded-[2rem] shadow-2xl p-2">
            <div className="flex flex-col gap-2">
              {actionItems.map((action) => {
                const Icon = action.icon;

                return (
                  <button
                    key={action.id}
                    onClick={() => handleActionClick(action.id)}
                    className={cn(
                      "flex items-center gap-3 pl-3 pr-6 py-2.5 rounded-full transition-all",
                      "bg-foreground text-background border border-transparent",
                      "hover:opacity-90"
                    )}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-background text-foreground"
                    >
                      <Icon size={18} weight="bold" />
                    </div>
                    <span className="font-semibold">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main FAB button */}
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300",
            "bg-primary text-primary-foreground hover:bg-primary/90",
            open && "rotate-45 bg-foreground text-background"
          )}
          aria-label={open ? "Fechar menu" : "Abrir menu de ações"}
          aria-expanded={open}
        >
          <Plus size={28} weight="bold" />
        </button>
      </div>

      {/* Modals */}
      <MatchSelectorModal
        matches={matches}
        open={chuteModalOpen}
        onOpenChange={setChuteModalOpen}
      />

      <ChallengeForm
        matches={matches}
        open={desafioModalOpen}
        onOpenChange={setDesafioModalOpen}
      />
    </>
  );
}
