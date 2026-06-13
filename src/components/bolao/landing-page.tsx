"use client";

import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { SneakerMove, Fire, GithubLogo } from "@phosphor-icons/react";
import { matches } from "@/lib/mock-data";
import { TeamFlag } from "@/components/bolao";

const staticCarouselMatches = matches
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  .slice(0, 8);

const crestExtensions: Record<string, string> = {
  ALG: "png", ARG: "png", AUS: "png", AUT: "svg", BEL: "png", BIH: "svg",
  BRA: "png", CAN: "png", CIV: "png", COD: "svg", COL: "svg", CPV: "png",
  CRO: "svg", CUW: "png", CZE: "png", ECU: "png", EGY: "png", ENG: "png",
  ESP: "png", FRA: "png", GER: "png", GHA: "png", HAI: "png", IRN: "png",
  IRQ: "png", JOR: "png", JPN: "png", KOR: "png", KSA: "png", MAR: "png",
  MEX: "png", NED: "png", NOR: "svg", NZL: "png", PAN: "svg", PAR: "png",
  POR: "png", QAT: "svg", RSA: "png", SCO: "png", SEN: "png", SUI: "png",
  SWE: "png", TUN: "png", TUR: "png", URU: "png", USA: "png", UZB: "png",
};

function getCrestPath(code: string): string {
  const ext = crestExtensions[code] || "png";
  return `/crests/${code}.${ext}`;
}

const monthNames = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function MatchCarouselCard({ homeFlag, awayFlag, homeCode, awayCode, homeName, awayName, date }: {
  homeFlag: string;
  awayFlag: string;
  homeCode: string;
  awayCode: string;
  homeName: string;
  awayName: string;
  date: string;
}) {
  const matchDate = new Date(date);
  const day = matchDate.getUTCDate().toString().padStart(2, "0");
  const month = monthNames[matchDate.getUTCMonth()];
  const formattedDate = `${day} ${month}`;

  return (
    <div className="shrink-0 w-[360px] h-[200px] bg-card border border-border/50 rounded-2xl p-6 shadow-sm flex items-center justify-between">
      {/* Home Team */}
      <div className="flex flex-col items-center gap-3">
        <TeamFlag flag={homeFlag} name={homeName} size="lg" />
        <span className="text-base font-semibold">{homeCode}</span>
      </div>
      
      {/* VS & Date */}
      <div className="flex flex-col items-center gap-2">
        <span className="text-2xl font-bold text-muted-foreground">vs</span>
        <span className="text-sm text-muted-foreground">{formattedDate}</span>
      </div>
      
      {/* Away Team */}
      <div className="flex flex-col items-center gap-3">
        <TeamFlag flag={awayFlag} name={awayName} size="lg" />
        <span className="text-base font-semibold">{awayCode}</span>
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <div className="fixed inset-0 top-16 overflow-hidden flex flex-col items-center pt-10 bg-background">
      {/* Hero Section */}
      <div className="relative z-10 flex flex-col items-center px-4">
        <div className="max-w-4xl text-center">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-normal tracking-tight leading-normal">
              <span className="inline-flex items-center gap-2">
                Faça seus chutes
                <SneakerMove className="inline w-[0.9em] h-[0.9em]" weight="bold" />
              </span>
              <br />
              <span className="inline-flex items-center gap-2">
                Desafie seus amigos
                <Fire className="inline w-[0.9em] h-[0.9em]" weight="bold" />
              </span>
            </h1>
            <p className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-none mt-1">
              Se torne o melhor<br />
              boleiro da turma.
            </p>
          </div>

          <SignInButton mode="modal">
            <Button className="h-10 sm:h-12 px-4 sm:px-5 text-sm sm:text-base rounded-full">
              Começar
            </Button>
          </SignInButton>
        </div>
      </div>

      {/* Match Cards Carousel */}
      <div className="mt-10 w-full overflow-hidden">
        <div className="flex gap-6 marquee-container">
          <div className="flex gap-6 animate-marquee-scroll">
            {staticCarouselMatches.map((match) => (
              <MatchCarouselCard
                key={match.id}
                homeFlag={getCrestPath(match.homeTeam.code)}
                awayFlag={getCrestPath(match.awayTeam.code)}
                homeCode={match.homeTeam.code}
                awayCode={match.awayTeam.code}
                homeName={match.homeTeam.name}
                awayName={match.awayTeam.name}
                date={match.date.toISOString()}
              />
            ))}
          </div>
          <div className="flex gap-6 animate-marquee-scroll" aria-hidden="true">
            {staticCarouselMatches.map((match) => (
              <MatchCarouselCard
                key={`dup-${match.id}`}
                homeFlag={getCrestPath(match.homeTeam.code)}
                awayFlag={getCrestPath(match.awayTeam.code)}
                homeCode={match.homeTeam.code}
                awayCode={match.awayTeam.code}
                homeName={match.homeTeam.name}
                awayName={match.awayTeam.name}
                date={match.date.toISOString()}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Disclaimers */}
      <div className="flex-1 flex flex-col items-center justify-center gap-1 sm:gap-2 text-[11px] sm:text-base text-white/50 px-4 text-center">
        <p>Sem apostas em dinheiro, apenas diversão.</p>
        <p>Crie suas ligas privadas e compartilhe com seus amigos.</p>
        <p>Login seguro via Google, não armazenamos senhas.</p>
      </div>

      {/* Footer */}
      <div className="pb-4 flex items-center gap-3 text-xs text-white/30">
        <p>© 2026 Doug Lima. All rights reserved.</p>
        <a
          href="https://github.com/doug-slima/bolao-copa-26"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white/50 transition-colors"
          aria-label="GitHub Repository"
        >
          <GithubLogo size={16} weight="bold" />
        </a>
      </div>
    </div>
  );
}
