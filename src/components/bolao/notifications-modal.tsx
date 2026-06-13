"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { X, Bell, Fire, Check, XCircle } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  getPendingNotifications,
  subscribeToNotifications,
  type Notification,
} from "@/lib/db/notifications";
import { acceptChallenge, declineChallenge } from "@/lib/db/challenges";

interface NotificationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNotificationAction?: () => void;
}

export function NotificationsModal({
  open,
  onOpenChange,
  onNotificationAction,
}: NotificationsModalProps) {
  const { userId, isSignedIn } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (open && isSignedIn && userId) {
      loadNotifications();
    }
  }, [open, isSignedIn, userId]);

  useEffect(() => {
    if (!isSignedIn || !userId) return;

    const unsubscribe = subscribeToNotifications(userId, (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => unsubscribe();
  }, [isSignedIn, userId]);

  const loadNotifications = async () => {
    if (!userId) return;
    setLoading(true);
    const notifs = await getPendingNotifications(userId);
    setNotifications(notifs);
    setLoading(false);
  };

  const handleAccept = async (notification: Notification) => {
    if (!notification.metadata?.challengeId) return;
    setActionLoading(notification.id);
    
    const result = await acceptChallenge(notification.metadata.challengeId);
    if (result.success) {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      onNotificationAction?.();
    }
    
    setActionLoading(null);
  };

  const handleDecline = async (notification: Notification) => {
    if (!notification.metadata?.challengeId) return;
    setActionLoading(notification.id);
    
    const result = await declineChallenge(notification.metadata.challengeId);
    if (result.success) {
      setNotifications((prev) => prev.filter((n) => n.id !== notification.id));
      onNotificationAction?.();
    }
    
    setActionLoading(null);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d atrás`;
    if (hours > 0) return `${hours}h atrás`;
    if (minutes > 0) return `${minutes}min atrás`;
    return "Agora";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell size={20} weight="fill" className="text-primary" />
            Notificações
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-pulse text-muted-foreground">
                Carregando...
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Bell size={48} className="text-muted-foreground" />
              <p className="text-muted-foreground text-center">
                Nenhuma notificação pendente
              </p>
            </div>
          ) : (
            <div className="space-y-3 pb-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "bg-card border border-border/50 rounded-xl p-4",
                    notification.type === "challenge_received" &&
                      "border-orange-500/30"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                        notification.type === "challenge_received" &&
                          "bg-orange-500/10"
                      )}
                    >
                      {notification.type === "challenge_received" && (
                        <Fire
                          size={20}
                          weight="fill"
                          className="text-orange-500"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{notification.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTimeAgo(notification.createdAt)}
                      </p>
                    </div>
                  </div>

                  {notification.type === "challenge_received" && (
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        onClick={() => handleAccept(notification)}
                        disabled={actionLoading === notification.id}
                        className="flex-1"
                      >
                        <Check size={16} className="mr-1" />
                        Aceitar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDecline(notification)}
                        disabled={actionLoading === notification.id}
                        className="flex-1"
                      >
                        <XCircle size={16} className="mr-1" />
                        Recusar
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
