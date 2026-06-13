import Link from "next/link";
import { MatchCard } from "./match-card";
import { RankingTable } from "./ranking-table";
import { getUpcomingMatches, getAllMatches, getAllTeams } from "@/lib/api";
import { mockUserRankings } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

export async function Dashboard() {
  const [upcomingMatches, allMatches, allTeams] = await Promise.all([
    getUpcomingMatches(4),
    getAllMatches(),
    getAllTeams(),
  ]);

  const topRankings = mockUserRankings.slice(0, 3);
  const totalMatches = allMatches.length;
  const totalTeams = allTeams.length;
  const totalGroups = 12;

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative py-8 md:py-12">
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Copa do Mundo 2026
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Faça seus palpites
          </h1>

          <p className="text-lg text-muted-foreground mb-8">
            {totalTeams} times, {totalMatches} jogos, um campeão.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/jogos">
              <Button className="w-full sm:w-auto h-12 text-base rounded-full px-8">
                Ver Jogos
              </Button>
            </Link>
            <Link href="/ranking">
              <Button variant="outline" className="w-full sm:w-auto h-12 text-base rounded-full px-8">
                Ver Ranking
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-10">
          <div className="text-center">
            <p className="text-3xl font-bold">{totalTeams}</p>
            <p className="text-sm text-muted-foreground">Times</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{totalGroups}</p>
            <p className="text-sm text-muted-foreground">Grupos</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold">{totalMatches}</p>
            <p className="text-sm text-muted-foreground">Jogos</p>
          </div>
        </div>
      </section>

      {/* Upcoming Matches */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Próximos Jogos</h2>
          <Link
            href="/jogos"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Ver todos
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {upcomingMatches.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>

        {upcomingMatches.length === 0 && (
          <div className="text-center py-8 bg-card rounded-2xl border border-border/50">
            <p className="text-muted-foreground">
              Nenhum jogo agendado no momento
            </p>
          </div>
        )}
      </section>

      {/* Ranking Preview */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Top Ranking</h2>
          <Link
            href="/ranking"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Ver completo
          </Link>
        </div>

        <RankingTable rankings={topRankings} compact />
      </section>

      {/* How it Works */}
      <section className="bg-card rounded-2xl border border-border/50 p-6 md:p-8">
        <h2 className="text-xl font-semibold mb-6 text-center">Como Funciona</h2>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">1</span>
            </div>
            <h3 className="font-medium mb-2">Faça seu palpite</h3>
            <p className="text-sm text-muted-foreground">
              Escolha o placar de cada jogo até 5 minutos antes do início
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">2</span>
            </div>
            <h3 className="font-medium mb-2">Acompanhe os jogos</h3>
            <p className="text-sm text-muted-foreground">
              Veja seus palpites e torça pelo seu placar durante a partida
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">3</span>
            </div>
            <h3 className="font-medium mb-2">Ganhe pontos</h3>
            <p className="text-sm text-muted-foreground">
              10 pts para placar exato, 5 pts para vencedor certo, 3 pts para
              empate
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
