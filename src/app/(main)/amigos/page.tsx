"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { Users } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { getUserLeagues, getLeagueMembers } from "@/lib/db/leagues";

interface Friend {
  id: string;
  name: string;
  avatarUrl: string | null;
  totalPoints: number;
  position: number;
}

export default function AmigosPage() {
  const { isSignedIn, userId } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [friends, setFriends] = useState<Friend[]>([]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadFriends = async () => {
      setLoading(true);
      try {
        const leagues = await getUserLeagues(userId);
        
        const memberMap = new Map<string, Friend>();
        
        for (const league of leagues) {
          const members = await getLeagueMembers(league.id);
          for (const member of members) {
            if (member.userId !== userId && !memberMap.has(member.userId)) {
              memberMap.set(member.userId, {
                id: member.userId,
                name: member.userName,
                avatarUrl: member.userAvatarUrl,
                totalPoints: 0,
                position: 0,
              });
            }
          }
        }
        
        setFriends(Array.from(memberMap.values()));
      } catch (error) {
        console.error("Error loading friends:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFriends();
  }, [userId]);

  const filteredFriends = useMemo(() => {
    return friends.filter((f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [friends, searchQuery]);

  if (!isSignedIn) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Amigos</h1>
        </div>
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Users size={48} className="text-muted-foreground" />
          <p className="text-muted-foreground text-center">
            Faça login para ver seus amigos
          </p>
          <SignInButton mode="modal">
            <Button>Entrar</Button>
          </SignInButton>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Amigos</h1>
          <p className="text-muted-foreground">
            Membros das suas ligas
          </p>
        </div>
        <div className="h-48 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Amigos</h1>
        <p className="text-muted-foreground">
          Membros das suas ligas
        </p>
      </div>

      {/* Search */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Buscar amigo..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 h-12 text-base bg-muted rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-foreground"
        />
      </div>

      {/* Friends List */}
      <div>
        <h2 className="font-semibold mb-4">
          Boleiros ({filteredFriends.length})
        </h2>
        
        {filteredFriends.length > 0 ? (
          <div className="space-y-2">
            {filteredFriends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border/50"
              >
                <div className="flex items-center gap-3">
                  {friend.avatarUrl ? (
                    <img
                      src={friend.avatarUrl}
                      alt={friend.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center font-medium">
                      {friend.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{friend.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-card rounded-2xl border border-border/50">
            <Users size={48} className="mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              {searchQuery
                ? "Nenhum boleiro encontrado"
                : "Entre em uma liga para ver os membros"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
