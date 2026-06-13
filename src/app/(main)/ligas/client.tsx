"use client";

import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import {
  Users,
  Plus,
  Ticket,
  CheckCircle,
  Copy,
  FlagBanner,
  WhatsappLogo,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LeagueCard } from "@/components/bolao/league-card";
import { MobileTabSelect } from "@/components/bolao/mobile-tab-select";
import { cn } from "@/lib/utils";
import type { League } from "@/types";
import {
  getUserLeagues as dbGetUserLeagues,
  createLeague as dbCreateLeague,
  joinLeague as dbJoinLeague,
  deleteLeague as dbDeleteLeague,
  leaveLeague as dbLeaveLeague,
  type DbLeague,
} from "@/lib/db/leagues";

type TabMode = "minhas" | "criar";

export function LigasPageClient() {
  const { isSignedIn, userId } = useAuth();
  const { user } = useUser();
  const [tabMode, setTabMode] = useState<TabMode>("minhas");
  const [mounted, setMounted] = useState(false);

  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<DbLeague | null>(null);
  const [joining, setJoining] = useState(false);

  const [leagueName, setLeagueName] = useState("");
  const [leagueDescription, setLeagueDescription] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [createdLeague, setCreatedLeague] = useState<DbLeague | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);

  const [userLeagues, setUserLeagues] = useState<DbLeague[]>([]);
  const [loadingLeagues, setLoadingLeagues] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && userId) {
      refreshLeagues();
    }
  }, [mounted, userId]);

  const refreshLeagues = async () => {
    if (!userId) return;
    setLoadingLeagues(true);
    const leagues = await dbGetUserLeagues(userId);
    setUserLeagues(leagues);
    setLoadingLeagues(false);
  };

  const handleJoinLeague = async () => {
    if (!userId || !user || !joinCode.trim()) return;

    setJoinError(null);
    setJoining(true);
    
    const result = await dbJoinLeague(joinCode.trim());

    setJoining(false);

    if (result.success && result.league) {
      setJoinSuccess(result.league);
      setJoinCode("");
      refreshLeagues();
      setTimeout(() => setJoinSuccess(null), 3000);
    } else {
      setJoinError(result.error || "Erro ao entrar na liga");
    }
  };

  const handleCreateLeague = async () => {
    if (!userId || !user) return;

    setCreateError(null);
    setCreating(true);
    
    const result = await dbCreateLeague({
      name: leagueName,
      description: leagueDescription || undefined,
    });

    setCreating(false);

    if (result.success && result.league) {
      setCreatedLeague(result.league);
      setShowSuccessModal(true);
      setLeagueName("");
      setLeagueDescription("");
      refreshLeagues();
    } else {
      setCreateError(result.error || "Erro ao criar liga");
    }
  };

  const handleCopyCode = () => {
    if (!createdLeague) return;
    navigator.clipboard.writeText(createdLeague.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    if (!createdLeague) return;
    const text = `Entre na minha liga "${createdLeague.name}" no Bolão Copa 26! 🏆⚽\n\nUse o código: *${createdLeague.inviteCode}*`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encodedText}`, "_blank");
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setCreatedLeague(null);
    setTabMode("minhas");
  };

  const handleDeleteLeague = async (leagueId: string) => {
    const result = await dbDeleteLeague(leagueId);
    if (result.success) {
      refreshLeagues();
    }
  };

  const handleLeaveLeague = async (leagueId: string) => {
    if (!userId) return;
    const result = await dbLeaveLeague(leagueId, userId);
    if (result.success) {
      refreshLeagues();
    }
  };

  if (!mounted) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Ligas</h1>
        </div>
        <div className="h-96 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Ligas</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Users size={48} className="text-muted-foreground" />
          <p className="text-muted-foreground text-center">
            Faça login para participar de ligas
          </p>
          <SignInButton mode="modal">
            <Button>Entrar</Button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Ligas</h1>
        
        {/* Desktop tabs */}
        <div className="hidden sm:flex items-center gap-2">
          {(["minhas", "criar"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setTabMode(tab)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                tabMode === tab
                  ? "bg-foreground text-background"
                  : "border border-white/40 text-muted-foreground hover:text-foreground hover:border-white/70"
              )}
            >
              {tab === "minhas" && "Minhas Ligas"}
              {tab === "criar" && "Criar Liga"}
            </button>
          ))}
        </div>

        {/* Mobile tabs */}
        <div className="sm:hidden">
          <MobileTabSelect
            value={tabMode}
            onChange={(value) => setTabMode(value as TabMode)}
            options={[
              { value: "minhas", label: "Minhas Ligas" },
              { value: "criar", label: "Criar Liga" },
            ]}
          />
        </div>
      </div>

      {/* Tab: Minhas Ligas */}
      {tabMode === "minhas" && (
        <div className="space-y-8">
          {/* Subtitle */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground text-center">
              Participe de ligas com seus amigos
            </p>
          </div>

          {/* Join with Code Card */}
          <div className="bg-card border border-border/50 rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Ticket size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Tem um código de convite?</h3>
                <p className="text-sm text-muted-foreground">
                  Digite abaixo para entrar em uma liga
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                placeholder="Ex: ABC123"
                value={joinCode}
                onChange={(e) => {
                  setJoinCode(e.target.value.toUpperCase());
                  setJoinError(null);
                }}
                className="flex-1 uppercase h-12 text-base"
                maxLength={6}
              />
              <Button 
                onClick={handleJoinLeague} 
                disabled={!joinCode.trim() || joining}
                className="h-12 px-6 text-base rounded-full w-full sm:w-auto"
              >
                {joining ? "Entrando..." : "Entrar na Liga"}
              </Button>
            </div>

            {joinError && (
              <p className="text-sm text-destructive mt-2">{joinError}</p>
            )}

            {joinSuccess && (
              <div className="flex items-center gap-2 text-green-500 mt-2">
                <CheckCircle size={16} weight="fill" />
                <span className="text-sm">
                  Você entrou na liga "{joinSuccess.name}"!
                </span>
              </div>
            )}
          </div>

          {/* User Leagues */}
          {loadingLeagues ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse text-muted-foreground">Carregando suas ligas...</div>
            </div>
          ) : userLeagues.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Ligas Ativas</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userLeagues.map((league) => (
                  <LeagueCard
                    key={league.id}
                    league={{
                      id: league.id,
                      name: league.name,
                      description: league.description || undefined,
                      inviteCode: league.inviteCode,
                      createdBy: league.createdBy,
                      createdByName: league.createdByName,
                      memberCount: league.memberCount,
                      createdAt: league.createdAt,
                    }}
                    currentUserId={userId}
                    userPosition={null}
                    onDelete={handleDeleteLeague}
                    onLeave={handleLeaveLeague}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <FlagBanner size={48} className="text-muted-foreground" />
              <p className="text-muted-foreground text-center">
                Você ainda não participa de nenhuma liga
              </p>
              <Button 
                variant="outline" 
                onClick={() => setTabMode("criar")}
                className="h-12 px-6 text-base rounded-full"
              >
                <Plus size={16} className="mr-2" />
                Criar uma Liga
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Criar Liga */}
      {tabMode === "criar" && (
        <div className="space-y-8">
          {/* Subtitle */}
          <div className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground text-center">
              Crie uma liga e convide seus amigos
            </p>
          </div>

          {/* Create Form */}
          <div className="bg-card border border-border/50 rounded-2xl p-6 max-w-lg mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <FlagBanner size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Nova Liga</h3>
                <p className="text-sm text-muted-foreground">
                  Preencha os dados da sua liga
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Nome da Liga *
                </label>
                <Input
                  placeholder="Ex: Amigos do Trabalho"
                  value={leagueName}
                  onChange={(e) => {
                    setLeagueName(e.target.value);
                    setCreateError(null);
                  }}
                  maxLength={50}
                  className="h-12 text-base"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Descrição (opcional)
                </label>
                <Input
                  placeholder="Ex: Bolão da galera do escritório"
                  value={leagueDescription}
                  onChange={(e) => setLeagueDescription(e.target.value)}
                  maxLength={100}
                  className="h-12 text-base"
                />
              </div>

              {createError && (
                <p className="text-sm text-destructive">{createError}</p>
              )}

              <Button
                className="w-full h-12 text-base rounded-full"
                onClick={handleCreateLeague}
                disabled={!leagueName.trim() || creating}
              >
                <Plus size={18} className="mr-2" />
                {creating ? "Criando..." : "Criar Liga"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Liga Criada!</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center gap-6 py-4">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle size={40} weight="fill" className="text-green-500" />
            </div>

            <div className="text-center">
              <p className="text-muted-foreground mb-4">
                Compartilhe o código abaixo com seus amigos:
              </p>
              <div className="bg-muted rounded-xl px-6 py-4 text-center">
                <span className="text-3xl font-mono font-bold tracking-widest">
                  {createdLeague?.inviteCode}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full">
              <Button
                className="w-full h-12 text-base rounded-full bg-[#25D366] hover:bg-[#20BD5A] text-white"
                onClick={handleShareWhatsApp}
              >
                <WhatsappLogo size={20} weight="fill" className="mr-2" />
                Compartilhar no WhatsApp
              </Button>
              <Button
                variant="outline"
                className="w-full h-12 text-base rounded-full"
                onClick={handleCopyCode}
              >
                <Copy size={18} className="mr-2" />
                {copied ? "Copiado!" : "Copiar Código"}
              </Button>
            </div>

            <Button variant="ghost" onClick={closeSuccessModal}>
              Ir para Minhas Ligas
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
