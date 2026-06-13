import { DesafioPageClient } from "./client";
import { getUpcomingMatches, getTodayMatches } from "@/lib/api";

export const metadata = {
  title: "Desafie - WC26",
  description: "Desafie seus amigos",
};

export const revalidate = 300;

export default async function DesafioPage() {
  const [upcomingMatches, todayMatches] = await Promise.all([
    getUpcomingMatches(20),
    getTodayMatches(),
  ]);

  const allAvailableMatches = [...todayMatches, ...upcomingMatches].filter(
    (match, index, self) => self.findIndex((m) => m.id === match.id) === index
  );

  return <DesafioPageClient matches={allAvailableMatches} />;
}
