"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ThemeSelector } from "@/components/bolao";

export default function PerfilPage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Você precisa estar logado</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-card rounded-2xl border border-border/50 p-6">
        <div className="flex items-center gap-4">
          {user.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.fullName || "Avatar"}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-2xl font-bold">
              {user.firstName?.charAt(0) || "?"}
            </div>
          )}
          <div>
            <h1 className="text-2xl font-bold">{user.fullName || "Usuário"}</h1>
            <p className="text-muted-foreground">
              {user.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-border/50 p-4 text-center">
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-muted-foreground">Pontos</p>
        </div>
        <div className="bg-card rounded-2xl border border-border/50 p-4 text-center">
          <p className="text-2xl font-bold">0</p>
          <p className="text-sm text-muted-foreground">Palpites</p>
        </div>
        <div className="bg-card rounded-2xl border border-border/50 p-4 text-center">
          <p className="text-2xl font-bold">-</p>
          <p className="text-sm text-muted-foreground">Posição</p>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="bg-card rounded-2xl border border-border/50 p-6">
        <h2 className="text-lg font-semibold mb-4">Aparência</h2>
        <ThemeSelector />
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => {}}
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Notificações
        </Button>

        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => {}}
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Ajuda
        </Button>

        <Button
          variant="destructive"
          className="w-full justify-start"
          onClick={() => signOut()}
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sair
        </Button>
      </div>
    </div>
  );
}
