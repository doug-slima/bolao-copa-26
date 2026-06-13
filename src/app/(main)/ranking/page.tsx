import { Suspense } from "react";
import { RankingPageClient } from "./client";
import { getAllMatches } from "@/lib/api";

export const metadata = {
  title: "Ranking - Bolão Copa 26",
  description: "Ranking dos melhores boleiros",
};

function RankingLoadingFallback() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ranking</h1>
      </div>
      <div className="h-96 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    </div>
  );
}

export default async function RankingPage() {
  const matches = await getAllMatches();
  return (
    <Suspense fallback={<RankingLoadingFallback />}>
      <RankingPageClient matches={matches} />
    </Suspense>
  );
}
