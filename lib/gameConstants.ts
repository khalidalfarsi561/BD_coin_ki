export const COLLECTIONS = Object.freeze({
  USERS: "users",
  LEVELS: "levels",
  CARDS: "cards",
  USER_CARDS: "user_cards",
});

export const LEVEL_THRESHOLDS = Object.freeze([
  {
    id: "earthling",
    name: "Earthling",
    minKiRequired: 0,
    multiplier: 1,
    emoji: "🧑",
    aura: "shadow-white/10",
  },
  {
    id: "saiyan",
    name: "Saiyan",
    minKiRequired: 800,
    multiplier: 2,
    emoji: "🐒",
    aura: "shadow-yellow-200/30",
  },
  {
    id: "super_saiyan",
    name: "Super Saiyan",
    minKiRequired: 8000,
    multiplier: 5,
    emoji: "👱‍♂️",
    aura: "shadow-yellow-400/60",
  },
  {
    id: "super_saiyan_2",
    name: "Super Saiyan 2",
    minKiRequired: 40000,
    multiplier: 10,
    emoji: "⚡",
    aura: "shadow-yellow-500/80",
  },
  {
    id: "super_saiyan_3",
    name: "Super Saiyan 3",
    minKiRequired: 180000,
    multiplier: 25,
    emoji: "🔥",
    aura: "shadow-yellow-600/100",
  },
  {
    id: "super_saiyan_god",
    name: "Super Saiyan God",
    minKiRequired: 750000,
    multiplier: 100,
    emoji: "🔴",
    aura: "shadow-red-500/80",
  },
  {
    id: "super_saiyan_blue",
    name: "Super Saiyan Blue",
    minKiRequired: 3500000,
    multiplier: 250,
    emoji: "🔵",
    aura: "shadow-blue-500/80",
  },
  {
    id: "ultra_instinct",
    name: "Ultra Instinct",
    minKiRequired: 15000000,
    multiplier: 1000,
    emoji: "⚪",
    aura: "shadow-slate-100/100",
  },
]);

export const GAME_CONSTANTS = Object.freeze({
  ENERGY_MAX: 100,
  CLICK_ENERGY_COST: 1,
  SYNC_INTERVAL_MS: 5000,
  OFFLINE_ENERGY_PER_MINUTE: 12,
  OFFLINE_ENERGY_MINUTES_CAP: 240,
  OFFLINE_SYNC_RETRY_DELAY_MS: 1500,
  PRESTIGE_REQ_KI: 10000000,
});

export const DEFAULT_LEVEL = LEVEL_THRESHOLDS[0];

export const getLevelByKi = (totalKi: number = 0) => {
  const ki = Number(totalKi) || 0;
  let currentLevel = DEFAULT_LEVEL;

  for (const level of LEVEL_THRESHOLDS) {
    if (ki >= level.minKiRequired) {
      currentLevel = level;
    }
  }

  return currentLevel;
};

export const getNextLevel = (currentLevelId: string) => {
  const currentIndex = LEVEL_THRESHOLDS.findIndex(
    (level) => level.id === currentLevelId,
  );
  if (currentIndex < 0) return null;
  return LEVEL_THRESHOLDS[currentIndex + 1] || null;
};

export const getLevelMultiplierByKi = (totalKi: number = 0) =>
  getLevelByKi(totalKi).multiplier;

export const getLevelIndexByKi = (totalKi: number = 0) => {
  const ki = Number(totalKi) || 0;
  let levelIndex = 1;

  for (let index = 0; index < LEVEL_THRESHOLDS.length; index += 1) {
    if (ki >= LEVEL_THRESHOLDS[index].minKiRequired) {
      levelIndex = index + 1;
    }
  }

  return levelIndex;
};
