"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth, UserButton } from "@clerk/nextjs";
import { List, SoccerBall, Trophy, FlagBanner, User } from "@phosphor-icons/react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { NotificationBadge } from "./notification-badge";
import { NotificationsModal } from "./notifications-modal";

const navItems = [
  { href: "/jogos", label: "Jogos", icon: SoccerBall },
  { href: "/ranking", label: "Ranking", icon: Trophy },
  { href: "/ligas", label: "Ligas", icon: FlagBanner },
  { href: "/meu-bolao", label: "Meu Bolão", icon: User },
];

export function Header() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const isActiveRoute = (href: string) => {
    if (href === "/jogos") {
      return pathname === "/jogos" || pathname.startsWith("/jogos/");
    }
    if (href === "/ligas") {
      return pathname === "/ligas" || pathname.startsWith("/ligas/");
    }
    if (href === "/meu-bolao") {
      return pathname === "/meu-bolao" || pathname.startsWith("/meu-bolao/");
    }
    return pathname === href;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 relative">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">⚽</span>
            <span className="font-bold text-lg">Bolão Copa 2026</span>
          </Link>

          {/* Navigation - Desktop only */}
          {isLoaded && isSignedIn && (
            <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                    isActiveRoute(item.href)
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Desktop: UserButton or Sign In */}
            {isLoaded && isSignedIn ? (
              <>
                {/* Notification Badge */}
                <NotificationBadge
                  onClick={() => setNotificationsOpen(true)}
                  className="hidden md:flex"
                />

                {/* Desktop UserButton */}
                <div className="hidden md:block">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "h-8 w-8",
                      },
                    }}
                  />
                </div>

                {/* Mobile: Hamburger Menu */}
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild className="md:hidden">
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <List size={24} weight="bold" />
                      <span className="sr-only">Abrir menu</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-72 p-0">
                    <SheetHeader className="p-4 border-b border-border/50">
                      <SheetTitle className="flex items-center gap-2 text-left">
                        <span className="text-xl">⚽</span>
                        <span>Bolão Copa 2026</span>
                      </SheetTitle>
                    </SheetHeader>

                    <nav className="flex flex-col p-2">
                      {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-colors",
                              isActiveRoute(item.href)
                                ? "bg-secondary text-foreground"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                            )}
                          >
                            <Icon size={20} weight={isActiveRoute(item.href) ? "fill" : "bold"} />
                            {item.label}
                          </Link>
                        );
                      })}
                    </nav>

                    <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border/50 bg-background">
                      <UserButton
                        showName
                        appearance={{
                          elements: {
                            avatarBox: "h-10 w-10",
                            userButtonBox: "flex-row-reverse gap-3",
                            userButtonOuterIdentifier: "text-sm font-medium text-foreground",
                          },
                        }}
                      />
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            ) : isLoaded ? (
              <Link
                href="/sign-in"
                className="px-3.5 py-1.5 text-sm font-medium bg-foreground text-background rounded-full hover:opacity-90 transition-opacity"
              >
                Entrar
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      {/* Notifications Modal */}
      <NotificationsModal
        open={notificationsOpen}
        onOpenChange={setNotificationsOpen}
      />
    </header>
  );
}
