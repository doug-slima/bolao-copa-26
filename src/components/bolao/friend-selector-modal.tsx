"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { Users, MagnifyingGlass, FlagBanner } from "@phosphor-icons/react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { VisuallyHidden } from "radix-ui";
import { cn } from "@/lib/utils";
import { getAllFriendsWithLeagues, type FriendWithLeagues } from "@/lib/db/leagues";

interface FriendSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectFriend: (friend: FriendWithLeagues) => void;
  title?: string;
}

export function FriendSelectorModal({
  open,
  onOpenChange,
  onSelectFriend,
  title = "Escolher Amigo",
}: FriendSelectorModalProps) {
  const { userId } = useAuth();
  const [friends, setFriends] = useState<FriendWithLeagues[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (open && userId) {
      loadFriends();
    }
  }, [open, userId]);

  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  const loadFriends = async () => {
    if (!userId) return;
    setLoading(true);
    const allFriends = await getAllFriendsWithLeagues(userId);
    setFriends(allFriends);
    setLoading(false);
  };

  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return friends;
    const query = searchQuery.toLowerCase();
    return friends.filter((friend) =>
      friend.userName.toLowerCase().includes(query)
    );
  }, [friends, searchQuery]);

  const handleSelectFriend = (friend: FriendWithLeagues) => {
    onSelectFriend(friend);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <VisuallyHidden.Root>
          <DialogTitle>{title}</DialogTitle>
        </VisuallyHidden.Root>

        <div className="space-y-4">
          <div className="text-center space-y-1 pt-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Users size={24} weight="bold" className="text-primary" />
            </div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <p className="text-sm text-muted-foreground">
              Selecione um amigo para desafiar
            </p>
          </div>

          {friends.length > 5 && (
            <div className="relative">
              <MagnifyingGlass
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Buscar por nome..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-pulse text-muted-foreground">
                  Carregando amigos...
                </div>
              </div>
            ) : filteredFriends.length > 0 ? (
              filteredFriends.map((friend) => (
                <button
                  key={friend.userId}
                  onClick={() => handleSelectFriend(friend)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-colors",
                    "bg-muted hover:bg-muted/80"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                    {friend.userAvatarUrl ? (
                      <img
                        src={friend.userAvatarUrl}
                        alt={friend.userName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium">
                        {friend.userName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{friend.userName}</p>
                    <div className="flex items-center gap-1 flex-wrap">
                      {friend.leagues.slice(0, 3).map((league) => (
                        <span
                          key={league.id}
                          className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full"
                        >
                          {league.name}
                        </span>
                      ))}
                      {friend.leagues.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{friend.leagues.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            ) : friends.length === 0 ? (
              <div className="text-center py-8">
                <FlagBanner size={32} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Você ainda não tem amigos em suas ligas
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Convide pessoas para suas ligas para poder desafiá-las
                </p>
              </div>
            ) : (
              <div className="text-center py-8">
                <MagnifyingGlass size={32} className="mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Nenhum amigo encontrado
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tente buscar por outro nome
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
