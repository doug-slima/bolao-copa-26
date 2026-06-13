import { MatchCalendar } from "@/components/bolao";
import { getAllMatches, getGroupStandings, USE_API } from "@/lib/api";

export const metadata = {
  title: "Calendário - WC26",
  description: "Calendário de jogos da Copa do Mundo 2026",
};

export const revalidate = 300; // Revalidate every 5 minutes

export default async function JogosPage() {
  const [matches, standings] = await Promise.all([
    getAllMatches(),
    getGroupStandings(),
  ]);

  const subtitle = "Acompanhe todos os jogos da Copa!";

  return (
    <MatchCalendar 
      matches={matches}
      standings={standings}
      title="Calendário"
      subtitle={subtitle}
    />
  );
}
