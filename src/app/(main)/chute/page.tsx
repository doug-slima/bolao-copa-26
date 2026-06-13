import { ChutePageClient } from "./client";
import { getUpcomingMatches, getTodayMatches } from "@/lib/api";

export const metadata = {
  title: "Chute - WC26",
  description: "Faça seus palpites",
};

export const revalidate = 300;

export default async function ChutePage() {
  const [upcomingMatches, todayMatches] = await Promise.all([
    getUpcomingMatches(20),
    getTodayMatches(),
  ]);

  const allAvailableMatches = [...todayMatches, ...upcomingMatches].filter(
    (match, index, self) => self.findIndex((m) => m.id === match.id) === index
  );

  return <ChutePageClient matches={allAvailableMatches} />;
}
