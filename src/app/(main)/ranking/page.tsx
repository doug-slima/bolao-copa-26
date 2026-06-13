import { RankingPageClient } from "./client";
import { getAllMatches } from "@/lib/api";

export const metadata = {
  title: "Ranking - Bolão Copa 26",
  description: "Ranking dos melhores boleiros",
};

export default async function RankingPage() {
  const matches = await getAllMatches();
  return <RankingPageClient matches={matches} />;
}
