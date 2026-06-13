"use client";

import { useState } from "react";
import type { League } from "@/types";
import { Users, FlagBanner, Trophy, DotsThree, Trash, SignOut, UserPlus } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface LeagueCardProps {
  league: League;
  currentUserId?: string;
  userPosition?: number | null;
  onClick?: () => void;
  onDelete?: (leagueId: string) => Promise<void>;
  onLeave?: (leagueId: string) => Promise<void>;
  className?: string;
}

export function LeagueCard({
  league,
  currentUserId,
  userPosition,
  onClick,
  onDelete,
  onLeave,
  className,
}: LeagueCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [loading, setLoading] = useState(false);

  const isCreator = currentUserId === league.createdBy;
  const showMenu = currentUserId && (onDelete || onLeave);

  const handleDelete = async () => {
    if (!onDelete) return;
    setLoading(true);
    await onDelete(league.id);
    setLoading(false);
    setShowDeleteDialog(false);
  };

  const handleLeave = async () => {
    if (!onLeave) return;
    setLoading(true);
    await onLeave(league.id);
    setLoading(false);
    setShowLeaveDialog(false);
  };

  return (
    <>
      <div
        className={cn(
          "w-full text-left bg-card border border-border/50 rounded-2xl p-5 transition-all relative",
          "hover:border-border hover:shadow-md",
          className
        )}
      >
        {showMenu && (
          <div className="absolute top-3 right-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <DotsThree size={20} weight="bold" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="bg-background/80 backdrop-blur-xl border border-border/50 rounded-3xl shadow-xl p-2 !w-auto !min-w-0"
              >
                <DropdownMenuItem
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-600 text-white hover:bg-green-700 focus:bg-green-600 cursor-pointer whitespace-nowrap"
                  onClick={() => {
                    const text = `Entre na minha liga "${league.name}" no Bolão Copa 26! 🏆⚽\n\nUse o código: *${league.inviteCode}*`;
                    const encodedText = encodeURIComponent(text);
                    window.open(`https://wa.me/?text=${encodedText}`, "_blank");
                  }}
                >
                  <UserPlus size={16} weight="bold" />
                  <span className="font-medium text-sm">Convidar Amigos</span>
                </DropdownMenuItem>
                {isCreator && onDelete ? (
                  <DropdownMenuItem
                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-destructive text-destructive-foreground hover:opacity-90 focus:bg-destructive focus:text-destructive-foreground mt-1.5 cursor-pointer"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash size={16} weight="bold" />
                    <span className="font-medium text-sm">Excluir Liga</span>
                  </DropdownMenuItem>
                ) : onLeave ? (
                  <DropdownMenuItem
                    className="flex items-center gap-2 px-2.5 py-2 rounded-full bg-destructive text-destructive-foreground hover:opacity-90 focus:bg-destructive focus:text-destructive-foreground mt-1.5 cursor-pointer"
                    onClick={() => setShowLeaveDialog(true)}
                  >
                    <SignOut size={16} weight="bold" />
                    <span className="font-medium text-sm">Sair da Liga</span>
                  </DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <button onClick={onClick} className="w-full text-left">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0 pr-8">
              <h3 className="font-semibold text-lg truncate">{league.name}</h3>
              {league.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {league.description}
                </p>
              )}
            </div>

            {userPosition && (
              <div
                className={cn(
                  "shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium",
                  userPosition === 1
                    ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                    : userPosition === 2
                      ? "bg-zinc-300/30 text-zinc-600 dark:text-zinc-400"
                      : userPosition === 3
                        ? "bg-amber-600/20 text-amber-700 dark:text-amber-500"
                        : "bg-muted text-muted-foreground"
                )}
              >
                {userPosition <= 3 ? (
                  <Trophy size={14} weight="fill" />
                ) : (
                  <span>#</span>
                )}
                {userPosition}º
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users size={16} />
              <span>{league.memberCount} membros</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FlagBanner size={16} />
              <span>por {league.createdByName}</span>
            </div>
          </div>
        </button>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir liga?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a liga "{league.name}"? Esta ação não pode ser desfeita e todos os membros serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading} className="h-10 rounded-full">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="h-10 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sair da liga?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja sair da liga "{league.name}"? Você poderá entrar novamente com o código de convite.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading} className="h-10 rounded-full">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLeave}
              disabled={loading}
              className="h-10 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Saindo..." : "Sair"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
