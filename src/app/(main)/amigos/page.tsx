"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { mockUserRankings } from "@/lib/mock-data";

export default function AmigosPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const friends = mockUserRankings.filter((u) => u.userId !== "current_user");

  const filteredFriends = friends.filter((f) =>
    f.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Amigos</h1>
        <p className="text-muted-foreground">
          Gerencie sua lista de amigos
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Buscar amigo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2 bg-muted rounded-xl border-none focus:outline-none focus:ring-2 focus:ring-foreground"
        />
        <Button>Adicionar</Button>
      </div>

      {/* Friend Requests */}
      <div className="bg-card rounded-2xl border border-border/50 p-4">
        <h2 className="font-semibold mb-3">Solicitações</h2>
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhuma solicitação pendente
        </p>
      </div>

      {/* Friends List */}
      <div>
        <h2 className="font-semibold mb-4">
          Seus Amigos ({filteredFriends.length})
        </h2>
        
        {filteredFriends.length > 0 ? (
          <div className="space-y-2">
            {filteredFriends.map((friend) => (
              <div
                key={friend.userId}
                className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border/50"
              >
                <div className="flex items-center gap-3">
                  {friend.avatarUrl ? (
                    <img
                      src={friend.avatarUrl}
                      alt={friend.userName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-medium">
                      {friend.userName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{friend.userName}</p>
                    <p className="text-sm text-muted-foreground">
                      {friend.totalPoints} pts • #{friend.position}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Desafiar
                  </Button>
                  <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <svg
                      className="w-5 h-5 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-2xl border border-border/50">
            <p className="text-muted-foreground">
              {searchQuery
                ? "Nenhum amigo encontrado"
                : "Você ainda não tem amigos adicionados"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
