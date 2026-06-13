"use client";

import type { MetricLeader } from "@/types";
import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  description?: string;
  icon: PhosphorIcon;
  iconColor?: string;
  leaders: MetricLeader[];
  emptyMessage?: string;
}

export function MetricCard({
  title,
  description,
  icon: Icon,
  iconColor = "text-primary",
  leaders,
  emptyMessage = "Nenhum dado disponível",
}: MetricCardProps) {
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-1">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
            "bg-secondary"
          )}
        >
          <Icon size={16} weight="bold" className={iconColor} />
        </div>
        <h3 className="font-semibold text-sm">{title}</h3>
      </div>
      {description && (
        <p className="text-xs text-muted-foreground mb-3">{description}</p>
      )}
      {!description && <div className="mb-2" />}

      {leaders.length === 0 ? (
        <p className="text-xs text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="space-y-2">
          {leaders.map((leader, index) => (
            <div
              key={leader.userId}
              className={cn(
                "flex items-center gap-2",
                index === 0 && "font-medium"
              )}
            >
              <span
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0",
                  index === 0
                    ? "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                    : index === 1
                      ? "bg-zinc-300/30 text-zinc-500 dark:text-zinc-400"
                      : index === 2
                        ? "bg-amber-600/20 text-amber-700 dark:text-amber-500"
                        : "bg-muted text-muted-foreground"
                )}
              >
                {index + 1}
              </span>
              <span className="text-xs truncate flex-1">{leader.userName}</span>
              {leader.label && (
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {leader.label}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface SingleMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: PhosphorIcon;
  iconColor?: string;
  trend?: "up" | "down" | "same";
  trendValue?: string;
}

export function SingleMetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-primary",
  trend,
  trendValue,
}: SingleMetricCardProps) {
  return (
    <div className="bg-card border border-border/50 rounded-2xl p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
            "bg-secondary"
          )}
        >
          <Icon size={16} weight="bold" className={iconColor} />
        </div>
        <span className="text-xs text-muted-foreground">{title}</span>
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold">{value}</span>
        {trend && trendValue && (
          <span
            className={cn(
              "text-xs font-medium",
              trend === "up" && "text-green-500",
              trend === "down" && "text-red-500",
              trend === "same" && "text-muted-foreground"
            )}
          >
            {trend === "up" && "↑"}
            {trend === "down" && "↓"}
            {trendValue}
          </span>
        )}
      </div>

      {subtitle && (
        <span className="text-xs text-muted-foreground mt-1">{subtitle}</span>
      )}
    </div>
  );
}
