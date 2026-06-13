import { MeuBolaoClient } from "./client";
import { getAllMatches } from "@/lib/api";

export const metadata = {
  title: "Meu Bolão | Bolão Copa do Mundo 2026",
  description: "Suas atividades, chutes, desafios e ligas",
};

export default async function MeuBolaoPage() {
  const matches = await getAllMatches();

  return <MeuBolaoClient matches={matches} />;
}
