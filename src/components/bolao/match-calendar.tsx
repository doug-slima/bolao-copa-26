"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Match, GroupStanding } from "@/types";
import { MatchCard } from "./match-card";
import { Switcher } from "./switcher";
import { GroupStandings } from "./group-standings";
import { KnockoutMatchCard } from "./knockout-match-card";
import { getKnockoutMatchesByStage } from "@/lib/knockout-structure";

interface MatchCalendarProps {
  matches: Match[];
  standings?: GroupStanding[];
  title?: string;
  subtitle?: string;
  className?: string;
}

type ViewMode = "list" | "groups" | "knockout";
type TimeFilter = "past" | "today" | "upcoming";
type KnockoutStage = "round32" | "round16" | "quarter" | "semi" | "final";

const groupLabels = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

const timeFilterOptions = [
  { value: "past" as const, label: "Jogos Passados" },
  { value: "today" as const, label: "Jogos de Hoje" },
  { value: "upcoming" as const, label: "Próximos Jogos" },
];

const knockoutStageOptions = [
  { value: "round32" as const, label: "16 Avos de Final" },
  { value: "round16" as const, label: "Oitavas de Final" },
  { value: "quarter" as const, label: "Quartas de Final" },
  { value: "semi" as const, label: "Semifinal" },
  { value: "final" as const, label: "Final" },
];

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function isBeforeDay(date: Date, reference: Date): boolean {
  const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const d2 = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  return d1 < d2;
}

function isAfterDay(date: Date, reference: Date): boolean {
  const d1 = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const d2 = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  return d1 > d2;
}

export function MatchCalendar({ 
  matches, 
  standings,
  title = "Calendário",
  subtitle,
  className 
}: MatchCalendarProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("upcoming");
  const [knockoutStage, setKnockoutStage] = useState<KnockoutStage>("round32");

  const today = useMemo(() => new Date(), []);

  const filteredMatches = useMemo(() => {
    let result = [...matches];

    // Filter by time
    if (timeFilter === "past") {
      result = result.filter((m) => isBeforeDay(m.date, today));
    } else if (timeFilter === "today") {
      result = result.filter((m) => isSameDay(m.date, today));
    } else if (timeFilter === "upcoming") {
      result = result.filter((m) => isAfterDay(m.date, today));
    }

    // Sort by date
    return result.sort((a, b) => {
      if (timeFilter === "past") {
        return b.date.getTime() - a.date.getTime(); // Most recent first for past
      }
      return a.date.getTime() - b.date.getTime(); // Earliest first for upcoming
    });
  }, [matches, timeFilter, today]);

  const matchesByDate = useMemo(() => {
    const grouped = new Map<string, Match[]>();
    filteredMatches.forEach((match) => {
      const dateKey = match.date.toDateString();
      const existing = grouped.get(dateKey) || [];
      grouped.set(dateKey, [...existing, match]);
    });
    return grouped;
  }, [filteredMatches]);

  const matchesByGroup = useMemo(() => {
    const grouped = new Map<string, Match[]>();
    matches
      .filter((m) => m.stage === "group")
      .forEach((match) => {
        if (match.group) {
          const existing = grouped.get(match.group) || [];
          grouped.set(match.group, [...existing, match]);
        }
      });
    return grouped;
  }, [matches]);


  return (
    <div className={cn("space-y-10", className)}>
      {/* Header with title and view mode buttons */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full transition-all",
              viewMode === "list"
                ? "bg-foreground text-background"
                : "border border-white/40 text-muted-foreground hover:text-foreground hover:border-white/70"
            )}
          >
            Cronológico
          </button>
          <button
            onClick={() => setViewMode("groups")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full transition-all",
              viewMode === "groups"
                ? "bg-foreground text-background"
                : "border border-white/40 text-muted-foreground hover:text-foreground hover:border-white/70"
            )}
          >
            Por Grupo
          </button>
          <button
            onClick={() => setViewMode("knockout")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full transition-all",
              viewMode === "knockout"
                ? "bg-foreground text-background"
                : "border border-white/40 text-muted-foreground hover:text-foreground hover:border-white/70"
            )}
          >
            Mata-Mata
          </button>
        </div>
      </div>

      {/* Subtitle + Time filter (only in list view) */}
      {viewMode === "list" && (
        <div className="flex flex-col items-center gap-3">
          {subtitle && (
            <p className="text-muted-foreground text-center">{subtitle}</p>
          )}
          <Switcher
            options={timeFilterOptions}
            value={timeFilter}
            onChange={setTimeFilter}
          />
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-8">
          {Array.from(matchesByDate.entries()).map(([dateKey, dayMatches]) => (
            <div key={dateKey}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 sticky top-14 bg-background/80 backdrop-blur-sm py-2 -mx-1 px-1">
                {isSameDay(new Date(dateKey), today) ? (
                  <span className="text-foreground font-semibold">Hoje</span>
                ) : (
                  new Intl.DateTimeFormat("pt-BR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  }).format(new Date(dateKey))
                )}
              </h3>
              <div className="flex flex-col gap-6">
                {dayMatches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            </div>
          ))}

          {filteredMatches.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {timeFilter === "past" && "Nenhum jogo passado encontrado"}
                {timeFilter === "today" && "Nenhum jogo hoje"}
                {timeFilter === "upcoming" && "Nenhum próximo jogo encontrado"}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Groups View */}
      {viewMode === "groups" && standings && standings.length > 0 && (
        <GroupStandings standings={standings} />
      )}

      {/* Groups View Fallback (no standings) */}
      {viewMode === "groups" && (!standings || standings.length === 0) && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupLabels.map((group) => {
            const groupMatches = matchesByGroup.get(group) || [];
            return (
              <div key={group} className="bg-card rounded-2xl border border-border/50 overflow-hidden">
                <div className="p-4 border-b border-border/50">
                  <h3 className="text-lg font-semibold">Grupo {group}</h3>
                </div>
                <div className="p-3 flex flex-col gap-6">
                  {groupMatches.map((match) => (
                    <MatchCard key={match.id} match={match} compact />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Knockout View */}
      {viewMode === "knockout" && (
        <>
          {/* Subtitle + Stage filter */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-muted-foreground text-center">
              Acompanhe os jogos da fase mata-mata da Copa!
            </p>
            <Switcher
              options={knockoutStageOptions}
              value={knockoutStage}
              onChange={setKnockoutStage}
            />
          </div>

          {/* Knockout Matches */}
          <div className="flex flex-col gap-6">
            {getKnockoutMatchesByStage(knockoutStage).map((definition) => {
              const actualMatch = matches.find(
                (m) => m.id === String(definition.matchNumber)
              );
              return (
                <KnockoutMatchCard
                  key={definition.matchNumber}
                  definition={definition}
                  actualMatch={actualMatch}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
