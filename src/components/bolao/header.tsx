"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth, UserButton } from "@clerk/nextjs";

const navItems = [
  { href: "/ranking", label: "Ranking" },
  { href: "/jogos", label: "Calendário" },
  { href: "/ligas", label: "Ligas" },
];

export function Header() {
  const pathname = usePathname();
  const { isSignedIn, isLoaded } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center gap-0.5">
              <span className="w-6 h-6 rounded-full border-2 border-foreground flex items-center justify-center text-[10px] font-bold">
                W
              </span>
              <span className="w-6 h-6 rounded-full border-2 border-foreground flex items-center justify-center text-[10px] font-bold">
                C
              </span>
              <span className="w-6 h-6 rounded-full border-2 border-foreground flex items-center justify-center text-[10px] font-bold">
                2
              </span>
              <span className="w-6 h-6 rounded-full border-2 border-foreground flex items-center justify-center text-[10px] font-bold">
                6
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  pathname === item.href
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {isLoaded && isSignedIn ? (
              <Link
                href="/perfil"
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-lg transition-colors",
                  pathname === "/perfil"
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                Perfil
              </Link>
            ) : null}
            
            {isLoaded && isSignedIn ? (
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8",
                  },
                }}
              />
            ) : isLoaded ? (
              <Link
                href="/sign-in"
                className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
              >
                Entrar
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
