import { notFound } from "next/navigation";
import { getMatchById, getAllMatches } from "@/lib/api";
import { MatchDetailClient } from "./client";

interface PageProps {
  params: Promise<{ matchId: string }>;
}

export const revalidate = 300;

export async function generateStaticParams() {
  const matches = await getAllMatches();
  return matches.map((match) => ({
    matchId: match.id,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { matchId } = await params;
  const match = await getMatchById(matchId);
  if (!match) return { title: "Jogo não encontrado" };

  return {
    title: `${match.homeTeam.code} vs ${match.awayTeam.code} - WC26`,
    description: `Faça seu palpite para ${match.homeTeam.name} x ${match.awayTeam.name}`,
  };
}

export default async function MatchPage({ params }: PageProps) {
  const { matchId } = await params;
  const match = await getMatchById(matchId);

  if (!match) {
    notFound();
  }

  return <MatchDetailClient match={match} />;
}
