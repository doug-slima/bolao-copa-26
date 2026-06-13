"use client";

import { useEffect, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import { syncUser } from "@/lib/db/users";

export function UserSync() {
  const { isSignedIn, userId } = useAuth();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (isSignedIn && userId && !hasSynced.current) {
      hasSynced.current = true;
      syncUser().catch(console.error);
    }
  }, [isSignedIn, userId]);

  return null;
}
