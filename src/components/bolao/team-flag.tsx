"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface TeamFlagProps {
  flag: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeMap = {
  sm: { box: "w-10 h-10", emoji: "text-lg" },
  md: { box: "w-12 h-12", emoji: "text-2xl" },
  lg: { box: "w-14 h-14", emoji: "text-3xl" },
  xl: { box: "w-[72px] h-[72px]", emoji: "text-5xl" },
};

export function TeamFlag({ flag, name, size = "md", className }: TeamFlagProps) {
  const [imgError, setImgError] = useState(false);
  const isImagePath = flag && (
    flag.startsWith("http://") || 
    flag.startsWith("https://") || 
    flag.startsWith("/")
  );
  const sizes = sizeMap[size];
  
  if (isImagePath && !imgError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-white shadow-sm shrink-0 p-2",
          sizes.box,
          className
        )}
        style={{ borderRadius: 8 }}
      >
        <img
          src={flag}
          alt={`Escudo ${name}`}
          className="max-h-full max-w-full object-contain"
          loading="lazy"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center flex-shrink-0",
        sizes.emoji,
        className
      )}
      role="img"
      aria-label={`Bandeira ${name}`}
    >
      {getEmojiFlag(name) || "🏳️"}
    </span>
  );
}

function getEmojiFlag(teamName: string): string {
  const flagMap: Record<string, string> = {
    "Mexico": "🇲🇽", "México": "🇲🇽",
    "South Africa": "🇿🇦", "África do Sul": "🇿🇦",
    "Korea Republic": "🇰🇷", "Coreia do Sul": "🇰🇷",
    "Czech Republic": "🇨🇿", "Tchéquia": "🇨🇿",
    "Canada": "🇨🇦", "Canadá": "🇨🇦",
    "Bosnia and Herzegovina": "🇧🇦", "Bósnia": "🇧🇦",
    "Qatar": "🇶🇦", "Catar": "🇶🇦",
    "Switzerland": "🇨🇭", "Suíça": "🇨🇭",
    "Brazil": "🇧🇷", "Brasil": "🇧🇷",
    "Morocco": "🇲🇦", "Marrocos": "🇲🇦",
    "Haiti": "🇭🇹",
    "Scotland": "🏴󠁧󠁢󠁳󠁣󠁴󠁿", "Escócia": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    "United States": "🇺🇸", "EUA": "🇺🇸",
    "Paraguay": "🇵🇾", "Paraguai": "🇵🇾",
    "Australia": "🇦🇺", "Austrália": "🇦🇺",
    "Turkey": "🇹🇷", "Turquia": "🇹🇷",
    "Germany": "🇩🇪", "Alemanha": "🇩🇪",
    "Curaçao": "🇨🇼",
    "Ivory Coast": "🇨🇮", "Costa do Marfim": "🇨🇮",
    "Ecuador": "🇪🇨", "Equador": "🇪🇨",
    "Netherlands": "🇳🇱", "Holanda": "🇳🇱",
    "Japan": "🇯🇵", "Japão": "🇯🇵",
    "Sweden": "🇸🇪", "Suécia": "🇸🇪",
    "Tunisia": "🇹🇳", "Tunísia": "🇹🇳",
    "Belgium": "🇧🇪", "Bélgica": "🇧🇪",
    "Egypt": "🇪🇬", "Egito": "🇪🇬",
    "Iran": "🇮🇷", "Irã": "🇮🇷",
    "New Zealand": "🇳🇿", "Nova Zelândia": "🇳🇿",
    "Spain": "🇪🇸", "Espanha": "🇪🇸",
    "Cape Verde": "🇨🇻", "Cabo Verde": "🇨🇻",
    "Saudi Arabia": "🇸🇦", "Arábia Saudita": "🇸🇦",
    "Uruguay": "🇺🇾", "Uruguai": "🇺🇾",
    "France": "🇫🇷", "França": "🇫🇷",
    "Senegal": "🇸🇳",
    "Iraq": "🇮🇶", "Iraque": "🇮🇶",
    "Norway": "🇳🇴", "Noruega": "🇳🇴",
    "Argentina": "🇦🇷",
    "Algeria": "🇩🇿", "Argélia": "🇩🇿",
    "Austria": "🇦🇹", "Áustria": "🇦🇹",
    "Jordan": "🇯🇴", "Jordânia": "🇯🇴",
    "Portugal": "🇵🇹",
    "DR Congo": "🇨🇩", "RD Congo": "🇨🇩",
    "Uzbekistan": "🇺🇿", "Uzbequistão": "🇺🇿",
    "Colombia": "🇨🇴", "Colômbia": "🇨🇴",
    "England": "🏴󠁧󠁢󠁥󠁮󠁧󠁿", "Inglaterra": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    "Croatia": "🇭🇷", "Croácia": "🇭🇷",
    "Ghana": "🇬🇭", "Gana": "🇬🇭",
    "Panama": "🇵🇦", "Panamá": "🇵🇦",
  };
  
  return flagMap[teamName] || "";
}
