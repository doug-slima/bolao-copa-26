"use client";

import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { 
  isSameDayBrazil, 
  isBeforeDayBrazil, 
  isAfterDayBrazil, 
  getBrazilDateKey,
  formatWeekdayDateLong,
  getNowBrazil 
} from "@/lib/date-utils";
import { Match, GroupStanding } from "@/types";
import { MatchCard } from "./match-card";
import { Switcher } from "./switcher";
import { GroupStandings } from "./group-standings";
import { KnockoutMatchCard } from "./knockout-match-card";
import { MobileTabSelect } from "./mobile-tab-select";
import { getKnockoutMatchesByStage } from "@/lib/knockout-structure";
import { getUserLeagues } from "@/lib/db/leagues";
import { getLeaguePredictionCounts, getUserPredictions } from "@/lib/db/predictions";

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
  { value: "past" as const, label: "Jogos Passados", mobileLabel: "Passados" },
  { value: "today" as const, label: "Jogos de Hoje", mobileLabel: "Hoje" },
  { value: "upcoming" as const, label: "Próximos Jogos", mobileLabel: "Próximos" },
];

const knockoutStageOptions = [
  { value: "round32" as const, label: "16 Avos de Final", mobileLabel: "16ªs" },
  { value: "round16" as const, label: "Oitavas de Final", mobileLabel: "8ªs" },
  { value: "quarter" as const, label: "Quartas de Final", mobileLabel: "4ªs" },
  { value: "semi" as const, label: "Semifinal", mobileLabel: "Semi" },
  { value: "final" as const, label: "Final", mobileLabel: "Final" },
];

export function MatchCalendar({ 
  matches, 
  standings,
  title = "Calendário",
  subtitle,
  className 
}: MatchCalendarProps) {
  const { userId } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("today");
  const [knockoutStage, setKnockoutStage] = useState<KnockoutStage>("round32");
  const [predictionCounts, setPredictionCounts] = useState<Record<string, number>>({});
  const [userPredictions, setUserPredictions] = useState<Record<string, { homeScore: number; awayScore: number }>>({});

  const today = useMemo(() => getNowBrazil(), []);

  useEffect(() => {
    if (!userId) return;

    const loadData = async () => {
      const [leagues, predictions] = await Promise.all([
        getUserLeagues(userId),
        getUserPredictions(userId),
      ]);

      if (leagues.length > 0) {
        const matchIds = matches.map((m) => m.id);
        const counts = await getLeaguePredictionCounts(matchIds, leagues[0].id);
        setPredictionCounts(counts);
      }

      const predictionsMap: Record<string, { homeScore: number; awayScore: number }> = {};
      predictions.forEach((p) => {
        predictionsMap[p.matchId] = {
          homeScore: p.homeScore,
          awayScore: p.awayScore,
        };
      });
      setUserPredictions(predictionsMap);
    };

    loadData();
  }, [userId, matches]);

  const filteredMatches = useMemo(() => {
    let result = [...matches];

    // Filter by time (using Brazil timezone)
    if (timeFilter === "past") {
      result = result.filter((m) => isBeforeDayBrazil(m.date, today));
    } else if (timeFilter === "today") {
      result = result.filter((m) => isSameDayBrazil(m.date, today));
    } else if (timeFilter === "upcoming") {
      result = result.filter((m) => isAfterDayBrazil(m.date, today));
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
    const grouped = new Map<string, { date: Date; matches: Match[] }>();
    filteredMatches.forEach((match) => {
      const dateKey = getBrazilDateKey(match.date);
      const existing = grouped.get(dateKey);
      if (existing) {
        existing.matches.push(match);
      } else {
        grouped.set(dateKey, { date: match.date, matches: [match] });
      }
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
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>
        
        {/* Desktop view modes */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full transition-all",
              viewMode === "list"
                ? "bg-foreground text-background"
                : "border border-white/40 text-muted-foreground hover:text-foreground hover:border-white/70"
            )}
          >
            Por Data
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

        {/* Mobile view modes */}
        <div className="sm:hidden">
          <MobileTabSelect
            value={viewMode}
            onChange={(value) => setViewMode(value as ViewMode)}
            options={[
              { value: "list", label: "Por Data" },
              { value: "groups", label: "Por Grupo" },
              { value: "knockout", label: "Mata-Mata" },
            ]}
          />
        </div>
      </div>

      {/* Subtitle + Time filter (only in list view) */}
      {viewMode === "list" && (
        <div className="flex flex-col gap-3">
          {subtitle && (
            <p className="text-muted-foreground text-center">{subtitle}</p>
          )}
          <Switcher
            options={timeFilterOptions}
            value={timeFilter}
            onChange={setTimeFilter}
            fullWidth
          />
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-8">
          {Array.from(matchesByDate.entries()).map(([dateKey, { date, matches: dayMatches }]) => (
            <div key={dateKey}>
              <h3 className="text-sm font-medium text-muted-foreground mb-3 sticky top-14 bg-background/80 backdrop-blur-sm py-2 -mx-1 px-1">
                {isSameDayBrazil(date, today) ? (
                  <span className="text-foreground font-semibold">Hoje</span>
                ) : (
                  formatWeekdayDateLong(date)
                )}
              </h3>
              <div className="flex flex-col gap-6">
                {dayMatches.map((match) => (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    predictionCount={predictionCounts[match.id]}
                    userPrediction={userPredictions[match.id]}
                  />
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
                    <MatchCard 
                      key={match.id} 
                      match={match} 
                      compact 
                      predictionCount={predictionCounts[match.id]}
                      userPrediction={userPredictions[match.id]}
                    />
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
          <div className="flex flex-col gap-3">
            <p className="text-muted-foreground text-center">
              Acompanhe os jogos da fase mata-mata da Copa!
            </p>
            <Switcher
              options={knockoutStageOptions}
              value={knockoutStage}
              onChange={setKnockoutStage}
              fullWidth
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
