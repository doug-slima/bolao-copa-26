"use client";

import { cn } from "@/lib/utils";
import { Match } from "@/types";
import { TeamFlag } from "./team-flag";

interface KnockoutBracketProps {
  matches: Match[];
  className?: string;
}

interface BracketMatchData {
  id: string;
  matchNumber: number;
  date: Date;
  homeTeam: { name: string; code: string; flag: string } | null;
  awayTeam: { name: string; code: string; flag: string } | null;
  homeScore?: number;
  awayScore?: number;
  status: "scheduled" | "live" | "finished";
}

const KNOCKOUT_STRUCTURE = {
  round32: {
    left: [74, 77, 73, 75, 83, 84, 81, 82],
    right: [76, 78, 79, 80, 86, 88, 85, 87],
  },
  round16: {
    left: [89, 90, 93, 94],
    right: [91, 92, 95, 96],
  },
  quarters: {
    left: [97, 98],
    right: [99, 100],
  },
  semis: {
    left: [101],
    right: [102],
  },
  final: 104,
  thirdPlace: 103,
};

export function KnockoutBracket({ matches, className }: KnockoutBracketProps) {
  const knockoutMatches = matches.filter((m) => m.stage !== "group");

  const getMatchByNumber = (num: number): BracketMatchData | null => {
    const match = knockoutMatches.find((m) => {
      const matchNum = parseInt(m.id, 10);
      return matchNum === num || m.id === `${num}`;
    });

    if (!match) {
      return {
        id: `${num}`,
        matchNumber: num,
        date: new Date(),
        homeTeam: null,
        awayTeam: null,
        status: "scheduled",
      };
    }

    return {
      id: match.id,
      matchNumber: num,
      date: match.date,
      homeTeam: match.homeTeam.name !== "A definir" ? match.homeTeam : null,
      awayTeam: match.awayTeam.name !== "A definir" ? match.awayTeam : null,
      homeScore: match.score?.home,
      awayScore: match.score?.away,
      status: match.status,
    };
  };

  return (
    <div className={cn("overflow-x-auto pb-8", className)}>
      <div className="min-w-[1100px] relative">
        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-primary">
            COPA DO MUNDO 2026 - FASE DE MATA-MATA
          </h2>
        </div>

        {/* Trophy */}
        <div className="flex justify-center mb-4">
          <div className="text-6xl">🏆</div>
        </div>

        {/* Bracket Container */}
        <div className="flex justify-between items-start gap-4">
          {/* LEFT PATHWAY */}
          <div className="flex items-start">
            {/* Round of 32 - Left */}
            <div className="flex flex-col justify-around h-[800px]">
              <RoundHeader>Fase de 32</RoundHeader>
              {KNOCKOUT_STRUCTURE.round32.left.map((num) => (
                <MatchBox key={num} match={getMatchByNumber(num)} />
              ))}
            </div>

            {/* Connectors */}
            <div className="w-8 h-[800px] relative">
              {[0, 1, 2, 3].map((i) => (
                <Connector key={i} index={i} total={4} type="merge" />
              ))}
            </div>

            {/* Round of 16 - Left */}
            <div className="flex flex-col justify-around h-[800px]">
              <RoundHeader>Oitavas de Final</RoundHeader>
              {KNOCKOUT_STRUCTURE.round16.left.map((num) => (
                <MatchBox key={num} match={getMatchByNumber(num)} />
              ))}
            </div>

            {/* Connectors */}
            <div className="w-8 h-[800px] relative">
              {[0, 1].map((i) => (
                <Connector key={i} index={i} total={2} type="merge" />
              ))}
            </div>

            {/* Quarter Finals - Left */}
            <div className="flex flex-col justify-around h-[800px]">
              <RoundHeader>Quartas de Final</RoundHeader>
              {KNOCKOUT_STRUCTURE.quarters.left.map((num) => (
                <MatchBox key={num} match={getMatchByNumber(num)} />
              ))}
            </div>

            {/* Connectors */}
            <div className="w-8 h-[800px] relative">
              <Connector index={0} total={1} type="merge" />
            </div>

            {/* Semi Finals - Left */}
            <div className="flex flex-col justify-around h-[800px]">
              <RoundHeader>Semifinal</RoundHeader>
              {KNOCKOUT_STRUCTURE.semis.left.map((num) => (
                <MatchBox key={num} match={getMatchByNumber(num)} />
              ))}
            </div>

            {/* Connector to Final */}
            <div className="w-8 h-[800px] relative">
              <div className="absolute top-1/2 left-0 w-full border-t-2 border-dashed border-muted-foreground/30" />
            </div>
          </div>

          {/* CENTER - FINALS */}
          <div className="flex flex-col items-center justify-center h-[800px] gap-8">
            {/* Champion Label */}
            <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold">
              CAMPEÃO
            </div>

            {/* Final Match */}
            <div>
              <RoundHeader className="text-center">Final</RoundHeader>
              <MatchBox match={getMatchByNumber(KNOCKOUT_STRUCTURE.final)} variant="final" />
            </div>

            {/* Third Place Match */}
            <div className="mt-8">
              <RoundHeader className="text-center">3º e 4º lugar</RoundHeader>
              <MatchBox match={getMatchByNumber(KNOCKOUT_STRUCTURE.thirdPlace)} variant="third" />
            </div>
          </div>

          {/* RIGHT PATHWAY */}
          <div className="flex items-start flex-row-reverse">
            {/* Round of 32 - Right */}
            <div className="flex flex-col justify-around h-[800px]">
              <RoundHeader>Fase de 32</RoundHeader>
              {KNOCKOUT_STRUCTURE.round32.right.map((num) => (
                <MatchBox key={num} match={getMatchByNumber(num)} reversed />
              ))}
            </div>

            {/* Connectors */}
            <div className="w-8 h-[800px] relative">
              {[0, 1, 2, 3].map((i) => (
                <Connector key={i} index={i} total={4} type="merge" reversed />
              ))}
            </div>

            {/* Round of 16 - Right */}
            <div className="flex flex-col justify-around h-[800px]">
              <RoundHeader>Oitavas de Final</RoundHeader>
              {KNOCKOUT_STRUCTURE.round16.right.map((num) => (
                <MatchBox key={num} match={getMatchByNumber(num)} reversed />
              ))}
            </div>

            {/* Connectors */}
            <div className="w-8 h-[800px] relative">
              {[0, 1].map((i) => (
                <Connector key={i} index={i} total={2} type="merge" reversed />
              ))}
            </div>

            {/* Quarter Finals - Right */}
            <div className="flex flex-col justify-around h-[800px]">
              <RoundHeader>Quartas de Final</RoundHeader>
              {KNOCKOUT_STRUCTURE.quarters.right.map((num) => (
                <MatchBox key={num} match={getMatchByNumber(num)} reversed />
              ))}
            </div>

            {/* Connectors */}
            <div className="w-8 h-[800px] relative">
              <Connector index={0} total={1} type="merge" reversed />
            </div>

            {/* Semi Finals - Right */}
            <div className="flex flex-col justify-around h-[800px]">
              <RoundHeader>Semifinal</RoundHeader>
              {KNOCKOUT_STRUCTURE.semis.right.map((num) => (
                <MatchBox key={num} match={getMatchByNumber(num)} reversed />
              ))}
            </div>

            {/* Connector to Final */}
            <div className="w-8 h-[800px] relative">
              <div className="absolute top-1/2 left-0 w-full border-t-2 border-dashed border-muted-foreground/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface RoundHeaderProps {
  children: React.ReactNode;
  className?: string;
}

function RoundHeader({ children, className }: RoundHeaderProps) {
  return (
    <div
      className={cn(
        "bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-lg mb-2",
        className
      )}
    >
      {children}
    </div>
  );
}

interface MatchBoxProps {
  match: BracketMatchData | null;
  variant?: "default" | "final" | "third";
  reversed?: boolean;
}

function MatchBox({ match, variant = "default", reversed }: MatchBoxProps) {
  if (!match) return <div className="w-36 h-20" />;

  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(match.date);

  const isFinal = variant === "final";
  const isThird = variant === "third";

  return (
    <div
      className={cn(
        "w-40 border-2 rounded-lg overflow-hidden bg-card",
        isFinal && "border-yellow-500",
        isThird && "border-orange-500",
        !isFinal && !isThird && "border-primary/30"
      )}
    >
      {/* Header with date and match number */}
      <div
        className={cn(
          "flex items-center justify-between px-2 py-1 text-xs",
          isFinal && "bg-yellow-500/20",
          isThird && "bg-orange-500/20",
          !isFinal && !isThird && "bg-primary/10"
        )}
      >
        <span className="text-muted-foreground">{formattedDate}</span>
        <span
          className={cn(
            "font-bold px-1.5 py-0.5 rounded-lg text-xs",
            isFinal && "bg-yellow-500 text-yellow-950",
            isThird && "bg-orange-500 text-orange-950",
            !isFinal && !isThird && "bg-primary text-primary-foreground"
          )}
        >
          {match.matchNumber}
        </span>
      </div>

      {/* Teams */}
      <div className="divide-y divide-border/50">
        <TeamSlot
          team={match.homeTeam}
          score={match.homeScore}
          isWinner={
            match.status === "finished" &&
            match.homeScore !== undefined &&
            match.awayScore !== undefined &&
            match.homeScore > match.awayScore
          }
          reversed={reversed}
        />
        <TeamSlot
          team={match.awayTeam}
          score={match.awayScore}
          isWinner={
            match.status === "finished" &&
            match.homeScore !== undefined &&
            match.awayScore !== undefined &&
            match.awayScore > match.homeScore
          }
          reversed={reversed}
        />
      </div>
    </div>
  );
}

interface TeamSlotProps {
  team: { name: string; code: string; flag: string } | null;
  score?: number;
  isWinner?: boolean;
  reversed?: boolean;
}

function TeamSlot({ team, score, isWinner, reversed }: TeamSlotProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-2 py-1.5 min-h-[32px]",
        isWinner && "bg-green-500/10",
        reversed && "flex-row-reverse"
      )}
    >
      {team ? (
        <>
          <TeamFlag flag={team.flag} name={team.name} size="sm" />
          <span
            className={cn(
              "flex-1 text-sm truncate",
              isWinner && "font-semibold",
              reversed && "text-right"
            )}
          >
            {team.code}
          </span>
          {score !== undefined && (
            <span
              className={cn(
                "font-bold text-sm tabular-nums",
                isWinner && "text-green-600"
              )}
            >
              {score}
            </span>
          )}
        </>
      ) : (
        <span className="text-xs text-muted-foreground italic">A definir</span>
      )}
    </div>
  );
}

interface ConnectorProps {
  index: number;
  total: number;
  type: "merge";
  reversed?: boolean;
}

function Connector({ index, total, reversed }: ConnectorProps) {
  const segmentHeight = 100 / total;
  const top = segmentHeight * index + segmentHeight / 4;
  const height = segmentHeight / 2;

  return (
    <div
      className="absolute"
      style={{
        top: `${top}%`,
        height: `${height}%`,
        left: reversed ? "auto" : 0,
        right: reversed ? 0 : "auto",
        width: "100%",
      }}
    >
      {/* Horizontal line from first match */}
      <div
        className={cn(
          "absolute top-0 h-0 border-t-2 border-dashed border-muted-foreground/30",
          reversed ? "right-0" : "left-0"
        )}
        style={{ width: "50%" }}
      />
      {/* Vertical line */}
      <div
        className={cn(
          "absolute h-full border-l-2 border-dashed border-muted-foreground/30",
          reversed ? "right-1/2" : "left-1/2"
        )}
      />
      {/* Horizontal line from second match */}
      <div
        className={cn(
          "absolute bottom-0 h-0 border-t-2 border-dashed border-muted-foreground/30",
          reversed ? "right-0" : "left-0"
        )}
        style={{ width: "50%" }}
      />
      {/* Horizontal line to next round */}
      <div
        className={cn(
          "absolute top-1/2 h-0 border-t-2 border-dashed border-muted-foreground/30",
          reversed ? "left-0" : "right-0"
        )}
        style={{ width: "50%" }}
      />
    </div>
  );
}
