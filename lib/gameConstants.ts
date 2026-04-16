export const COLLECTIONS = Object.freeze({
  USERS: 'users',
  LEVELS: 'levels',
  CARDS: 'cards',
  USER_CARDS: 'user_cards',
});

export const LEVEL_THRESHOLDS = Object.freeze([
  { id: 'earthling', name: 'Earthling', minKiRequired: 0, multiplier: 1, emoji: '🧑', aura: 'shadow-white/10', image: 'https://picsum.photos/seed/dbz_earthling/200/200' },
  { id: 'saiyan', name: 'Saiyan', minKiRequired: 1000, multiplier: 2, emoji: '🐒', aura: 'shadow-yellow-200/30', image: 'https://picsum.photos/seed/dbz_saiyan/200/200' },
  { id: 'super_saiyan', name: 'Super Saiyan', minKiRequired: 10000, multiplier: 5, emoji: '👱‍♂️', aura: 'shadow-yellow-400/60', image: 'https://picsum.photos/seed/dbz_ssj1/200/200' },
  { id: 'super_saiyan_2', name: 'Super Saiyan 2', minKiRequired: 50000, multiplier: 10, emoji: '⚡', aura: 'shadow-yellow-500/80', image: 'https://picsum.photos/seed/dbz_ssj2/200/200' },
  { id: 'super_saiyan_3', name: 'Super Saiyan 3', minKiRequired: 250000, multiplier: 25, emoji: '🔥', aura: 'shadow-yellow-600/100', image: 'https://picsum.photos/seed/dbz_ssj3/200/200' },
  { id: 'super_saiyan_god', name: 'Super Saiyan God', minKiRequired: 1000000, multiplier: 100, emoji: '🔴', aura: 'shadow-red-500/80', image: 'https://picsum.photos/seed/dbz_ssjgod/200/200' },
  { id: 'super_saiyan_blue', name: 'Super Saiyan Blue', minKiRequired: 5000000, multiplier: 250, emoji: '🔵', aura: 'shadow-blue-500/80', image: 'https://picsum.photos/seed/dbz_ssjblue/200/200' },
  { id: 'ultra_instinct', name: 'Ultra Instinct', minKiRequired: 25000000, multiplier: 1000, emoji: '⚪', aura: 'shadow-slate-100/100', image: 'https://picsum.photos/seed/dbz_ui/200/200' },
]);

export const GAME_CONSTANTS = Object.freeze({
  ENERGY_MAX: 100,
  CLICK_ENERGY_COST: 1,
  SYNC_INTERVAL_MS: 5000,
  OFFLINE_ENERGY_PER_MINUTE: 12,
  OFFLINE_ENERGY_MINUTES_CAP: 240,
  OFFLINE_SYNC_RETRY_DELAY_MS: 1500,
  PRESTIGE_REQ_KI: 10000000, // 10 Million Ki for 1 Dragon Ball
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
  const currentIndex = LEVEL_THRESHOLDS.findIndex((level) => level.id === currentLevelId);
  if (currentIndex < 0) return null;
  return LEVEL_THRESHOLDS[currentIndex + 1] || null;
};

export const getLevelMultiplierByKi = (totalKi: number = 0) => getLevelByKi(totalKi).multiplier;
