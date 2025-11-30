import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatCurrency(value: bigint | number | undefined | null, decimals: number = 18): string {
  if (value === undefined || value === null) return "0.00";
  const num = typeof value === "bigint" ? Number(value) / Math.pow(10, decimals) : value;
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(num);
}

export function shareOnTwitter(text: string, url: string = window.location.href) {
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    text
  )}&url=${encodeURIComponent(url)}`;
  window.open(twitterUrl, "_blank", "width=550,height=420");
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function vibrate(pattern: number | number[] = 50) {
  if ("vibrate" in navigator) {
    navigator.vibrate(pattern);
  }
}
