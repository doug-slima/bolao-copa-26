"use client";

import { cn } from "@/lib/utils";

interface SwitcherOption<T extends string> {
  value: T;
  label: string;
  mobileLabel?: string;
}

interface SwitcherProps<T extends string> {
  options: SwitcherOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  size?: "sm" | "md";
  fullWidth?: boolean;
}

export function Switcher<T extends string>({
  options,
  value,
  onChange,
  className,
  size = "md",
  fullWidth = false,
}: SwitcherProps<T>) {
  return (
    <div className={cn("max-w-full", fullWidth && "w-full")}>
      <div
        className={cn(
          "flex items-center bg-muted rounded-full p-1",
          fullWidth ? "w-full" : "inline-flex",
          className
        )}
      >
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "font-medium rounded-full transition-all whitespace-nowrap",
              fullWidth && "flex-1 text-center",
              size === "sm" ? "px-3 py-1 text-xs" : "px-4 py-1.5 text-sm",
              value === option.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.mobileLabel ? (
              <>
                <span className="sm:hidden">{option.mobileLabel}</span>
                <span className="hidden sm:inline">{option.label}</span>
              </>
            ) : (
              option.label
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
