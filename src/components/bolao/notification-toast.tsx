"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { X, Fire, Bell } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  subscribeToNotifications,
  type Notification,
} from "@/lib/db/notifications";

interface ToastNotification extends Notification {
  visible: boolean;
}

export function NotificationToast() {
  const { userId, isSignedIn } = useAuth();
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  useEffect(() => {
    if (!isSignedIn || !userId) return;

    const unsubscribe = subscribeToNotifications(userId, (notification) => {
      const toastId = `${notification.id}-${Date.now()}`;
      const toast: ToastNotification = {
        ...notification,
        id: toastId,
        visible: true,
      };

      setToasts((prev) => [...prev, toast]);

      setTimeout(() => {
        setToasts((prev) =>
          prev.map((t) => (t.id === toastId ? { ...t, visible: false } : t))
        );
      }, 4500);

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toastId));
      }, 5000);
    });

    return () => unsubscribe();
  }, [isSignedIn, userId]);

  const dismissToast = (id: string) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
    );
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 300);
  };

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "bg-card border border-border shadow-lg rounded-xl p-4 transform transition-all duration-300",
            toast.visible
              ? "translate-y-0 opacity-100"
              : "translate-y-2 opacity-0",
            toast.type === "challenge_received" && "border-orange-500/50"
          )}
        >
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                toast.type === "challenge_received"
                  ? "bg-orange-500/10"
                  : "bg-primary/10"
              )}
            >
              {toast.type === "challenge_received" ? (
                <Fire size={20} weight="fill" className="text-orange-500" />
              ) : (
                <Bell size={20} weight="fill" className="text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{toast.title}</p>
              <p className="text-sm text-muted-foreground">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="p-1 hover:bg-secondary rounded-lg transition-colors"
            >
              <X size={16} className="text-muted-foreground" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
