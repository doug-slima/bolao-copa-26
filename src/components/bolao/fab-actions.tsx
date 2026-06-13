"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@clerk/nextjs";
import { Plus, SneakerMove, Fire } from "@phosphor-icons/react";

const actions = [
  {
    href: "/chute",
    label: "Chute",
    icon: SneakerMove,
  },
  {
    href: "/desafio",
    label: "Desafie",
    icon: Fire,
  },
];

export function FabActions() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);

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

  if (!isSignedIn) return null;

  return (
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
        <div className="bg-background/80 backdrop-blur-xl border-2 border-border/50 rounded-2xl shadow-2xl p-2">
          <div className="flex flex-col gap-2">
            {actions.map((action) => {
              const Icon = action.icon;
              const isActive = pathname === action.href;

              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className={cn(
                    "flex items-center gap-3 pl-3 pr-6 py-2.5 rounded-xl transition-all",
                    "bg-foreground text-background border border-transparent",
                    "hover:opacity-90",
                    isActive && "ring-2 ring-primary"
                  )}
                  onClick={() => setOpen(false)}
                >
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-foreground"
                    )}
                  >
                    <Icon size={18} weight={isActive ? "fill" : "bold"} />
                  </div>
                  <span className="font-semibold">{action.label}</span>
                </Link>
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
  );
}
