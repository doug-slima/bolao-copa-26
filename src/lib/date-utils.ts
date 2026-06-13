const BRAZIL_TIMEZONE = "America/Sao_Paulo";

export function formatMatchTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: BRAZIL_TIMEZONE,
  }).format(date);
}

export function formatMatchDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    timeZone: BRAZIL_TIMEZONE,
  }).format(date);
}

export function formatFullDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: BRAZIL_TIMEZONE,
  }).format(date);
}

export function formatDateWithTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: BRAZIL_TIMEZONE,
  }).format(date);
}

export function formatWeekdayDateLong(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: BRAZIL_TIMEZONE,
  }).format(date);
}

export function isSameDayBrazil(date1: Date, date2: Date): boolean {
  return getBrazilDateKey(date1) === getBrazilDateKey(date2);
}

export function isBeforeDayBrazil(date: Date, reference: Date): boolean {
  return getBrazilDateKey(date) < getBrazilDateKey(reference);
}

export function isAfterDayBrazil(date: Date, reference: Date): boolean {
  return getBrazilDateKey(date) > getBrazilDateKey(reference);
}

export function getBrazilDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: BRAZIL_TIMEZONE,
  }).format(date);
}

export function getNowBrazil(): Date {
  return new Date();
}
