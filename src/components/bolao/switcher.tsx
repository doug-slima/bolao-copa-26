"use client";

import { cn } from "@/lib/utils";

interface SwitcherOption<T extends string> {
  value: T;
  label: string;
}

interface SwitcherProps<T extends string> {
  options: SwitcherOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: "sm" | "md";
}

export function Switcher<T extends string>({
  options,
  value,
  onChange,
  className,
  size = "md",
}: SwitcherProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex items-center bg-muted rounded-full p-1",
        className
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "font-medium rounded-full transition-all",
            size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm",
            value === option.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
