"use client";

import {
  SneakerMove,
  Fire,
  Trophy,
  Target,
  Clock,
  Sword,
} from "@phosphor-icons/react";
import { POINTS } from "@/lib/scoring";

const CHALLENGE_POINTS = {
  WIN: 3,
  TIE: 1,
  BOTH_ZERO: -1,
} as const;

export function LoggedHome() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Como Funciona</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Entenda as regras de chutes e desafios para dominar o bolão!
        </p>
      </div>

      {/* Chutes Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <SneakerMove weight="bold" className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold">Chutes</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 - O que você pode chutar */}
          <div className="bg-card rounded-2xl border border-border/50 p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Target weight="bold" className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">O que você pode chutar</h3>
            </div>
            <ul className="text-muted-foreground text-xs space-y-2 list-disc list-inside flex-1">
              <li>Placar do Jogo</li>
              <li>Resultado Final do Jogo (vitória/empate)</li>
              <li>Que time marca primeiro</li>
            </ul>
          </div>

          {/* Card 2 - Pontuação */}
          <div className="bg-card rounded-2xl border border-border/50 p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Trophy weight="bold" className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">Pontuação</h3>
            </div>
            <ul className="text-muted-foreground text-xs space-y-2 list-disc list-inside flex-1">
              <li>
                Acertar o placar sozinho = <strong>{POINTS.EXACT_SCORE.unique} pts</strong>
              </li>
              <li>
                Acertar o placar com amigos = <strong>{POINTS.EXACT_SCORE.shared} pts</strong>
              </li>
              <li>
                Acertar o resultado sozinho = <strong>{POINTS.RESULT.unique} pts</strong>
              </li>
              <li>
                Acertar o resultado com amigos = <strong>{POINTS.RESULT.shared} pts</strong>
              </li>
              <li>
                Acertar 1º a marcar sozinho = <strong>{POINTS.FIRST_SCORER.unique} pts</strong>
              </li>
              <li>
                Acertar 1º a marcar com amigos = <strong>{POINTS.FIRST_SCORER.shared} pt</strong>
              </li>
            </ul>
          </div>

          {/* Card 3 - Prazo para chutar */}
          <div className="bg-card rounded-2xl border border-border/50 p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                <Clock weight="bold" className="w-4 h-4 text-orange-500" />
              </div>
              <h3 className="font-semibold text-sm">Prazo para chutar</h3>
            </div>
            <ul className="text-muted-foreground text-xs space-y-2 list-disc list-inside flex-1">
              <li>Um chute por categoria (Placar; Resultado; 1º a Marcar)</li>
              <li>
                Chutes até <strong>5 min antes</strong> do início do jogo
              </li>
              <li>
                Edições até <strong>5 min antes</strong> do início do jogo
              </li>
              <li>Após o prazo, não são aceitos novos chutes nem edições</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Desafios Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
            <Fire weight="bold" className="w-5 h-5 text-orange-500" />
          </div>
          <h2 className="text-xl font-semibold">Desafios</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 - Como funciona */}
          <div className="bg-card rounded-2xl border border-border/50 p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Sword weight="bold" className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">Como funciona</h3>
            </div>
            <ul className="text-muted-foreground text-xs space-y-2 list-disc list-inside flex-1">
              <li>Escolha um amigo e um jogo</li>
              <li>Se você não tiver chute, faça antes de enviar</li>
              <li>Seu amigo recebe e pode aceitar ou recusar</li>
              <li>Quem fizer mais pontos no jogo ganha o desafio</li>
            </ul>
          </div>

          {/* Card 2 - Pontuação */}
          <div className="bg-card rounded-2xl border border-border/50 p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Trophy weight="bold" className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">Pontuação</h3>
            </div>
            <ul className="text-muted-foreground text-xs space-y-2 list-disc list-inside flex-1">
              <li>
                Se você acertar o chute ={" "}
                <strong className="text-green-500">+{CHALLENGE_POINTS.WIN} pts pra você</strong>
              </li>
              <li>
                Se o amigo desafiado acertar o chute ={" "}
                <strong className="text-green-500">+{CHALLENGE_POINTS.WIN} pts pra ele</strong>
              </li>
              <li>
                Se ambos acertarem o chute ={" "}
                <strong className="text-blue-500">+{CHALLENGE_POINTS.TIE} pt pra cada</strong>
              </li>
              <li>
                Se ambos errarem o chute ={" "}
                <strong className="text-red-500">{CHALLENGE_POINTS.BOTH_ZERO} pt pra cada</strong>
              </li>
            </ul>
          </div>

          {/* Card 3 - Regras */}
          <div className="bg-card rounded-2xl border border-border/50 p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                <Clock weight="bold" className="w-4 h-4 text-orange-500" />
              </div>
              <h3 className="font-semibold text-sm">Regras</h3>
            </div>
            <ul className="text-muted-foreground text-xs space-y-2 list-disc list-inside flex-1">
              <li>Um desafio por jogo por amigo</li>
              <li>Desafios pendentes expiram com o deadline do jogo</li>
              <li>Se alguém não tiver chute, desafio é anulado</li>
              <li>Pontos do desafio são extras aos do chute</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Quick Tips */}
      <section className="bg-muted/50 rounded-2xl p-6">
        <h3 className="font-semibold mb-4 text-center">Dicas Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <span className="text-primary font-bold">1.</span>
            <p>Use o botão <strong className="text-foreground">+</strong> no rodapé para fazer chutes e desafios rapidamente</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary font-bold">2.</span>
            <p>Acompanhe sua performance na aba <strong className="text-foreground">Minha Performance</strong> no Ranking</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary font-bold">3.</span>
            <p>Crie ou entre em <strong className="text-foreground">Ligas</strong> para competir com seus amigos</p>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-primary font-bold">4.</span>
            <p>Fique de olho nos <strong className="text-foreground">Jogos</strong> para não perder nenhum deadline</p>
          </div>
        </div>
      </section>
    </div>
  );
}
