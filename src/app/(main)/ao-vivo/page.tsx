import { MatchCard } from "@/components/bolao";
import { getLiveMatches, getRecentMatches } from "@/lib/api";

export const metadata = {
  title: "Ao Vivo - WC26",
  description: "Jogos acontecendo agora",
};

export const revalidate = 60; // Revalidate every 1 minute for live matches

export default async function AoVivoPage() {
  const [liveMatches, recentMatches] = await Promise.all([
    getLiveMatches(),
    getRecentMatches(5),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ao Vivo</h1>
        <p className="text-muted-foreground">
          Acompanhe os jogos em tempo real
        </p>
      </div>

      {/* Live Matches */}
      {liveMatches.length > 0 ? (
        <div>
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Acontecendo Agora
          </h2>
          <div className="flex flex-col gap-6">
            {liveMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border/50 p-8 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <h3 className="font-semibold mb-2">Nenhum jogo ao vivo</h3>
          <p className="text-muted-foreground text-sm">
            Os jogos serão exibidos aqui quando começarem
          </p>
        </div>
      )}

      {/* Recent Results */}
      {recentMatches.length > 0 && (
        <div>
          <h2 className="font-semibold mb-4">Resultados Recentes</h2>
          <div className="flex flex-col gap-6">
            {recentMatches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
