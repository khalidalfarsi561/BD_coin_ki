import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export type GameCard = {
  id: string;
  name: string;
  description: string;
  base_cost: number;
  base_income_per_hour: number;
  category: string;
  rarity?: string;
  rarity_level?: string;
  tier?: string;
  image?: string;
  accent?: string;
  glow?: string;
};

export type GameBoost = {
  id: string;
  name: string;
  description: string;
  cost: number;
  multiplier: number;
  durationMs: number;
  type?: "energy_restore";
  image?: string;
};

export type OwnedCard = {
  card_id: string;
  current_level: number;
};

export type RandomDrop = {
  id: string;
  x: number;
  y: number;
  type: "ki" | "energy" | "boost";
};

export type QuestCounters = {
  clicks: number;
  upgrades: number;
};

export type QuestProgressState = {
  clicks: number;
  upgrades: number;
  totalKi: number;
  level: number;
  legendaryPurchase: number;
  dailyResetStamp: string;
  weeklyResetStamp: string;
  dailyCounters: QuestCounters;
  weeklyCounters: QuestCounters;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
