"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { Bell } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import {
  getUnreadNotificationCount,
  subscribeToNotifications,
  type Notification,
} from "@/lib/db/notifications";

interface NotificationBadgeProps {
  onClick?: () => void;
  className?: string;
}

export function NotificationBadge({ onClick, className }: NotificationBadgeProps) {
  const { userId, isSignedIn } = useAuth();
  const [count, setCount] = useState(0);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  useEffect(() => {
    if (!isSignedIn || !userId) return;

    loadNotificationCount();

    const unsubscribe = subscribeToNotifications(userId, (notification) => {
      setCount((prev) => prev + 1);
      setHasNewNotification(true);
      setTimeout(() => setHasNewNotification(false), 3000);
    });

    return () => unsubscribe();
  }, [isSignedIn, userId]);

  const loadNotificationCount = async () => {
    if (!userId) return;
    const notifCount = await getUnreadNotificationCount(userId);
    setCount(notifCount);
  };

  if (!isSignedIn) return null;

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative p-2 rounded-lg transition-colors hover:bg-secondary/50",
        hasNewNotification && "animate-pulse",
        className
      )}
      aria-label={`Notificações${count > 0 ? ` (${count} novas)` : ""}`}
    >
      <Bell size={22} weight={count > 0 ? "fill" : "bold"} />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full px-1">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
