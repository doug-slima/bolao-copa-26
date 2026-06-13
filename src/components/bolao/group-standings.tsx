"use client";

import { cn } from "@/lib/utils";
import { GroupStanding, TeamStanding } from "@/types";
import { TeamFlag } from "./team-flag";

interface GroupStandingsProps {
  standings: GroupStanding[];
  className?: string;
}

export function GroupStandings({ standings, className }: GroupStandingsProps) {
  return (
    <div className={cn("space-y-8", className)}>
      {standings.map((group) => (
        <GroupTable key={group.name} group={group} />
      ))}
    </div>
  );
}

interface GroupTableProps {
  group: GroupStanding;
}

function GroupTable({ group }: GroupTableProps) {
  return (
    <div className="bg-card rounded-2xl border border-border/50 overflow-hidden">
      {/* Group Header */}
      <div className="px-4 py-3 border-b border-border/50">
        <h2 className="text-lg font-bold">GRUPO {group.name}</h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-muted-foreground border-b border-border/30">
              <th className="text-left py-3 px-4 font-medium">CLASSIFICAÇÃO</th>
              <th className="text-center py-3 px-2 font-medium w-10">P</th>
              <th className="text-center py-3 px-2 font-medium w-10">J</th>
              <th className="text-center py-3 px-2 font-medium w-10">V</th>
              <th className="text-center py-3 px-2 font-medium w-10">E</th>
              <th className="text-center py-3 px-2 font-medium w-10">D</th>
              <th className="text-center py-3 px-2 font-medium w-10">GP</th>
              <th className="text-center py-3 px-2 font-medium w-10">GC</th>
              <th className="text-center py-3 px-2 font-medium w-10">SG</th>
              <th className="text-center py-3 px-2 font-medium w-12">%</th>
              <th className="text-center py-3 px-4 font-medium">ÚLT. JOGOS</th>
            </tr>
          </thead>
          <tbody>
            {group.standings.map((standing) => (
              <StandingRow key={standing.team.id} standing={standing} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface StandingRowProps {
  standing: TeamStanding;
}

function StandingRow({ standing }: StandingRowProps) {
  return (
    <tr className="border-b border-border/20 last:border-b-0 hover:bg-muted/30 transition-colors">
      {/* Position + Team */}
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground w-4 text-center font-medium">
            {standing.position}
          </span>
          <TeamFlag
            flag={standing.team.flag}
            name={standing.team.name}
            size="sm"
          />
          <span className="font-medium">{standing.team.name}</span>
        </div>
      </td>

      {/* Points */}
      <td className="text-center py-4 px-2 font-bold">{standing.points}</td>

      {/* Games Played */}
      <td className="text-center py-4 px-2 text-muted-foreground">
        {standing.played}
      </td>

      {/* Wins */}
      <td className="text-center py-4 px-2 text-muted-foreground">
        {standing.won}
      </td>

      {/* Draws */}
      <td className="text-center py-4 px-2 text-muted-foreground">
        {standing.drawn}
      </td>

      {/* Losses */}
      <td className="text-center py-4 px-2 text-muted-foreground">
        {standing.lost}
      </td>

      {/* Goals For */}
      <td className="text-center py-4 px-2 text-muted-foreground">
        {standing.goalsFor}
      </td>

      {/* Goals Against */}
      <td className="text-center py-4 px-2 text-muted-foreground">
        {standing.goalsAgainst}
      </td>

      {/* Goal Difference */}
      <td className="text-center py-4 px-2 text-muted-foreground">
        {standing.goalDifference > 0
          ? `+${standing.goalDifference}`
          : standing.goalDifference}
      </td>

      {/* Percentage */}
      <td className="text-center py-4 px-2 text-muted-foreground">
        {standing.percentage}
      </td>

      {/* Recent Results */}
      <td className="py-4 px-4">
        <div className="flex items-center justify-center gap-1">
          {standing.recentResults.length > 0 ? (
            standing.recentResults.map((result, index) => (
              <ResultDot key={index} result={result} />
            ))
          ) : (
            <span className="text-muted-foreground text-xs">-</span>
          )}
        </div>
      </td>
    </tr>
  );
}

interface ResultDotProps {
  result: "W" | "D" | "L";
}

function ResultDot({ result }: ResultDotProps) {
  return (
    <span
      className={cn(
        "w-3 h-3 rounded-full",
        result === "W" && "bg-green-500",
        result === "D" && "bg-yellow-500",
        result === "L" && "bg-red-500"
      )}
      title={
        result === "W" ? "Vitória" : result === "D" ? "Empate" : "Derrota"
      }
    />
  );
}
