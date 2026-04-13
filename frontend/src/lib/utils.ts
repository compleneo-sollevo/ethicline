import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number | string | null | undefined): string {
  if (value == null) return "–";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "–";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

export function formatNumber(value: number | string | null | undefined): string {
  if (value == null) return "–";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "–";
  return new Intl.NumberFormat("de-DE").format(num);
}

export function formatPercent(value: number | null | undefined): string {
  if (value == null) return "–";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)} %`;
}
