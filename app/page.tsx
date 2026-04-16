"use client";

import { useEffect, useMemo, useState } from "react";
import { Sparkles, Shield, Zap, ScrollText, Crown, Star } from "lucide-react";
import GokuClicker from "@/components/GokuClicker";
import MiningStore from "@/components/MiningStore";
import BottomNav from "@/components/BottomNav";
import DragonBallIcon from "@/components/DragonBallIcon";
import {
  COLLECTIONS,
  LEVEL_THRESHOLDS,
  getLevelByKi,
  getLevelIndexByKi,
  GAME_CONSTANTS,
} from "@/lib/gameConstants";
import type {
  GameBoost,
  GameCard,
  OwnedCard,
  QuestCounters,
  QuestProgressState,
  RandomDrop,
} from "@/lib/utils";

const formatKi = (value: number) => {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Math.max(0, Math.floor(Number(value) || 0)));
};

type CardRarity = "common" | "rare" | "epic" | "legendary";

type DemoCard = GameCard & {
  rarity: CardRarity;
  image?: string;
};

type DemoBoost = GameBoost & {
  image?: string;
};

const demoCards: DemoCard[] = [
  {
    id: "card-1",
    name: "King Kai's Training",
    description: "Boosts Ki generation with intense martial discipline.",
    base_cost: 100,
    base_income_per_hour: 12,
    category: COLLECTIONS.CARDS,
    rarity: "common",
    image: "https://picsum.photos/seed/dbz_kingkai/100/100",
  },
  {
    id: "card-2",
    name: "Hyperbolic Time Chamber",
    description: "Accelerates Ki flow and training gains dramatically.",
    base_cost: 500,
    base_income_per_hour: 75,
    category: COLLECTIONS.CARDS,
    rarity: "rare",
    image: "https://picsum.photos/seed/dbz_timechamber/100/100",
  },
  {
    id: "card-3",
    name: "Gravity Room",
    description: "Extreme gravity training for massive Ki gains.",
    base_cost: 2500,
    base_income_per_hour: 450,
    category: COLLECTIONS.CARDS,
    rarity: "epic",
    image: "https://picsum.photos/seed/dbz_gravityroom/100/100",
  },
  {
    id: "card-4",
    name: "Super Saiyan God Ritual",
    description:
      "Harness the power of six righteous Saiyans for godly Ki generation.",
    base_cost: 10000,
    base_income_per_hour: 2500,
    category: COLLECTIONS.CARDS,
    rarity: "legendary",
    image: "https://picsum.photos/seed/dbz_godritual/100/100",
  },
];

const demoBoosts: DemoBoost[] = [
  {
    id: "boost-1",
    name: "Senzu Bean Rush",
    description: "2x all Ki generation for 60 seconds.",
    cost: 1000,
    multiplier: 2,
    durationMs: 60000,
    image: "https://picsum.photos/seed/dbz_senzu/100/100",
  },
  {
    id: "boost-2",
    name: "Kaioken x10",
    description: "10x all Ki generation for 15 seconds.",
    cost: 5000,
    multiplier: 10,
    durationMs: 15000,
    image: "https://picsum.photos/seed/dbz_kaioken/100/100",
  },
  {
    id: "boost-energy",
    name: "Senzu Bean (Energy)",
    description: "Instantly restores all energy.",
    cost: 2000,
    multiplier: 1,
    durationMs: 0,
    type: "energy_restore",
    image: "https://picsum.photos/seed/dbz_senzu_energy/100/100",
  },
];

type QuestTab = "daily" | "weekly" | "permanent";

type QuestReward = {
  ki: number;
  energy?: number;
  unlock?: string;
};

type Quest = {
  id: string;
  tab: QuestTab;
  type: "clicks" | "upgrades" | "totalKi" | "level" | "legendaryPurchase";
  target: number;
  reward: QuestReward;
  title: string;
  desc: string;
  icon: typeof Zap;
  badge: string;
  theme: string;
};

type SavedGameState = {
  balanceKi?: number;
  totalKi?: number;
  energy?: number;
  userCards?: OwnedCard[];
  activeBoost?: {
    id: string;
    multiplier: number;
    expiresAt: number;
  } | null;
  dragonBalls?: number;
  claimedQuests?: string[];
  claimedQuestRewards?: string[];
  questRewardsCache?: Record<string, boolean>;
  questProgress?: Partial<QuestProgressState>;
  unlockedSecretCards?: string[];
  permanentAchievements?: string[];
  lastActive?: number;
};

const QUESTS: Quest[] = [
  {
    id: "daily-1",
    tab: "daily",
    type: "clicks",
    target: 500,
    reward: { ki: 5000, energy: 25 },
    title: "Novice Clicker",
    desc: "Tap 500 times today.",
    icon: Zap,
    badge: "Daily",
    theme: "from-orange-500/20 to-amber-500/10",
  },
  {
    id: "daily-2",
    tab: "daily",
    type: "upgrades",
    target: 3,
    reward: { ki: 8000, energy: 40 },
    title: "Card Trainee",
    desc: "Upgrade 3 cards today.",
    icon: ScrollText,
    badge: "Daily",
    theme: "from-yellow-500/20 to-orange-500/10",
  },
  {
    id: "weekly-1",
    tab: "weekly",
    type: "clicks",
    target: 3500,
    reward: { ki: 50000, energy: 150 },
    title: "Week of Training",
    desc: "Tap 3,500 times this week.",
    icon: Shield,
    badge: "Weekly",
    theme: "from-blue-500/20 to-cyan-500/10",
  },
  {
    id: "weekly-2",
    tab: "weekly",
    type: "upgrades",
    target: 20,
    reward: { ki: 90000, energy: 250 },
    title: "Z Fighter Routine",
    desc: "Upgrade 20 cards this week.",
    icon: Crown,
    badge: "Weekly",
    theme: "from-indigo-500/20 to-purple-500/10",
  },
  {
    id: "perm-1",
    tab: "permanent",
    type: "level",
    target: 10,
    reward: { ki: 250000, unlock: "Secret Card: Kai Realm Relic" },
    title: "Saiyan Ascension",
    desc: "Reach Level 10.",
    icon: Star,
    badge: "Permanent",
    theme: "from-fuchsia-500/20 to-orange-500/10",
  },
  {
    id: "perm-2",
    tab: "permanent",
    type: "legendaryPurchase",
    target: 1,
    reward: { ki: 500000, unlock: "Secret Card: Ultra Instinct Fragment" },
    title: "First Legendary",
    desc: "Purchase your first Legendary card.",
    icon: Sparkles,
    badge: "Permanent",
    theme: "from-emerald-500/20 to-cyan-500/10",
  },
];

const isQuestForCurrentCycle = (
  quest: Quest,
  resetDaily: boolean,
  resetWeekly: boolean,
) => {
  if (quest.tab === "permanent") return true;
  if (quest.tab === "daily") return !resetDaily;
  if (quest.tab === "weekly") return !resetWeekly;
  return true;
};

const normalizeQuestProgress = (
  questProgress: Partial<QuestProgressState> | undefined,
  todayStamp: string,
  weekStamp: string,
): QuestProgressState => {
  const savedDailyCounters: QuestCounters = {
    clicks: Number(questProgress?.dailyCounters?.clicks) || 0,
    upgrades: Number(questProgress?.dailyCounters?.upgrades) || 0,
  };
  const savedWeeklyCounters: QuestCounters = {
    clicks: Number(questProgress?.weeklyCounters?.clicks) || 0,
    upgrades: Number(questProgress?.weeklyCounters?.upgrades) || 0,
  };
  return {
    clicks: Number(questProgress?.clicks) || 0,
    upgrades: Number(questProgress?.upgrades) || 0,
    totalKi: Number(questProgress?.totalKi) || 0,
    level: Number(questProgress?.level) || 0,
    legendaryPurchase: Number(questProgress?.legendaryPurchase) || 0,
    dailyResetStamp: questProgress?.dailyResetStamp || todayStamp,
    weeklyResetStamp: questProgress?.weeklyResetStamp || weekStamp,
    dailyCounters: savedDailyCounters,
    weeklyCounters: savedWeeklyCounters,
  };
};

const createFreshQuestProgress = (
  todayStamp: string,
  weekStamp: string,
): QuestProgressState => ({
  clicks: 0,
  upgrades: 0,
  totalKi: 0,
  level: 0,
  legendaryPurchase: 0,
  dailyResetStamp: todayStamp,
  weeklyResetStamp: weekStamp,
  dailyCounters: { clicks: 0, upgrades: 0 },
  weeklyCounters: { clicks: 0, upgrades: 0 },
});

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [questTab, setQuestTab] = useState<QuestTab>("daily");
  const [questProgress, setQuestProgress] = useState<QuestProgressState>(
    createFreshQuestProgress("", ""),
  );
  const [unlockedSecretCards, setUnlockedSecretCards] = useState<string[]>([]);
  const [permanentAchievements, setPermanentAchievements] = useState<string[]>(
    [],
  );
  const [claimedQuestRewards, setClaimedQuestRewards] = useState<string[]>([]);
  const [questRewardsCache, setQuestRewardsCache] = useState<
    Record<string, boolean>
  >({});
  const [showOfflinePopup, setShowOfflinePopup] = useState(false);
  const [balanceKi, setBalanceKi] = useState<number>(0);
  const [totalKi, setTotalKi] = useState<number>(0);
  const [energy, setEnergy] = useState<number>(GAME_CONSTANTS.ENERGY_MAX);
  const [userCards, setUserCards] = useState<OwnedCard[]>([]);
  const [activeBoost, setActiveBoost] = useState<{
    id: string;
    multiplier: number;
    expiresAt: number;
  } | null>(null);
  const [offlineKiEarned, setOfflineKiEarned] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [dragonBalls, setDragonBalls] = useState(0);
  const [claimedQuests, setClaimedQuests] = useState<string[]>([]);
  const [randomDrop, setRandomDrop] = useState<RandomDrop | null>(null);

  const maxEnergyBonus = useMemo(() => {
    const energyCard = userCards.find((c) => c.card_id === "card-3");
    return energyCard ? energyCard.current_level * 10 : 0;
  }, [userCards]);

  const energyMax = GAME_CONSTANTS.ENERGY_MAX + maxEnergyBonus;
  const prestigeMultiplier = 1 + dragonBalls * 0.5;

  const level = useMemo(() => getLevelByKi(totalKi), [totalKi]);
  const levelMultiplier = (level?.multiplier || 1) * prestigeMultiplier;
  const currentMultiplier = activeBoost ? activeBoost.multiplier : 1;
  const getLocalDayStamp = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  };
  const getLocalWeekStamp = () => {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    monday.setDate(monday.getDate() + diffToMonday);
    return `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
  };
  const getQuestProgressValue = (quest: Quest) => {
    if (quest.type === "clicks")
      return quest.tab === "daily"
        ? questProgress.dailyCounters.clicks
        : questProgress.weeklyCounters.clicks;
    if (quest.type === "upgrades")
      return quest.tab === "daily"
        ? questProgress.dailyCounters.upgrades
        : questProgress.weeklyCounters.upgrades;
    if (quest.type === "totalKi") return totalKi;
    if (quest.type === "level") return getLevelIndexByKi(totalKi);
    if (quest.type === "legendaryPurchase")
      return questProgress.legendaryPurchase;
    return 0;
  };

  const passiveKiPerSecond = useMemo(
    () =>
      userCards.reduce((total: number, ownedCard) => {
        const card = demoCards.find((item) => item.id === ownedCard.card_id);
        const perSecond = (Number(card?.base_income_per_hour) || 0) / 3600;
        return total + perSecond * ownedCard.current_level;
      }, 0) *
      currentMultiplier *
      prestigeMultiplier,
    [userCards, currentMultiplier, prestigeMultiplier],
  );

  useEffect(() => {
    const savedState = localStorage.getItem("dragonBallKiState");
    const todayStamp = getLocalDayStamp();
    const weekStamp = getLocalWeekStamp();

    if (savedState) {
      try {
        const parsed: SavedGameState = JSON.parse(savedState);
        const savedCards = parsed.userCards || [];
        setUserCards(savedCards);

        const savedBoost = parsed.activeBoost;
        if (savedBoost && savedBoost.expiresAt > Date.now()) {
          setActiveBoost(savedBoost);
        }

        setDragonBalls(Number(parsed.dragonBalls) || 0);

        const resetDaily =
          (parsed.questProgress?.dailyResetStamp || "") !== todayStamp;
        const resetWeekly =
          (parsed.questProgress?.weeklyResetStamp || "") !== weekStamp;

        const savedClaimedQuests = parsed.claimedQuests || [];
        const resetQuestClaims = savedClaimedQuests.filter((questId) => {
          const questDef = QUESTS.find((quest) => quest.id === questId);
          return questDef
            ? isQuestForCurrentCycle(questDef, resetDaily, resetWeekly)
            : false;
        });

        const savedClaimedQuestRewards = parsed.claimedQuestRewards || [];
        const resetQuestRewards = savedClaimedQuestRewards.filter((questId) =>
          resetQuestClaims.includes(questId),
        );

        const savedQuestRewardsCache = parsed.questRewardsCache || {};
        const resetQuestRewardsCache = Object.fromEntries(
          Object.entries(savedQuestRewardsCache).filter(([questId, value]) => {
            const questDef = QUESTS.find((quest) => quest.id === questId);
            if (!questDef) return false;
            if (!Boolean(value)) return false;
            return isQuestForCurrentCycle(questDef, resetDaily, resetWeekly);
          }),
        );

        setClaimedQuests(resetQuestClaims);
        setClaimedQuestRewards(resetQuestRewards);
        setQuestRewardsCache(resetQuestRewardsCache as Record<string, boolean>);
        setUnlockedSecretCards(parsed.unlockedSecretCards || []);
        setPermanentAchievements(parsed.permanentAchievements || []);

        const now = Date.now();
        const lastActive = parsed.lastActive || now;
        const elapsedMs = Math.max(0, now - lastActive);
        const elapsedSeconds = Math.floor(elapsedMs / 1000);
        const elapsedMinutes = Math.floor(elapsedMs / 60000);

        const savedPassiveKiPerSecond = savedCards.reduce(
          (total: number, ownedCard) => {
            const card = demoCards.find(
              (item) => item.id === ownedCard.card_id,
            );
            const perSecond = (Number(card?.base_income_per_hour) || 0) / 3600;
            return total + perSecond * ownedCard.current_level;
          },
          0,
        );

        const cappedMinutes = Math.min(
          elapsedMinutes,
          GAME_CONSTANTS.OFFLINE_ENERGY_MINUTES_CAP,
        );
        const cappedSeconds = Math.min(
          elapsedSeconds,
          GAME_CONSTANTS.OFFLINE_ENERGY_MINUTES_CAP * 60,
        );

        const earnedKi = Math.floor(cappedSeconds * savedPassiveKiPerSecond);
        const recoveredEnergy = Math.floor(
          cappedMinutes * GAME_CONSTANTS.OFFLINE_ENERGY_PER_MINUTE,
        );

        setBalanceKi((Number(parsed.balanceKi) || 0) + earnedKi);
        setTotalKi((Number(parsed.totalKi) || 0) + earnedKi);
        setEnergy(
          Math.min(
            GAME_CONSTANTS.ENERGY_MAX,
            (Number(parsed.energy) || GAME_CONSTANTS.ENERGY_MAX) +
              recoveredEnergy,
          ),
        );

        const normalizedProgress = normalizeQuestProgress(
          parsed.questProgress,
          todayStamp,
          weekStamp,
        );
        const normalizedTotalKi = Number(parsed.totalKi) || 0;

        setQuestProgress({
          ...normalizedProgress,
          totalKi: Number(normalizedProgress.totalKi) || normalizedTotalKi,
          level: getLevelIndexByKi(
            Number(normalizedProgress.totalKi) || normalizedTotalKi,
          ),
          dailyCounters: resetDaily
            ? { clicks: 0, upgrades: 0 }
            : normalizedProgress.dailyCounters,
          weeklyCounters: resetWeekly
            ? { clicks: 0, upgrades: 0 }
            : normalizedProgress.weeklyCounters,
          dailyResetStamp: todayStamp,
          weeklyResetStamp: weekStamp,
        });

        if (earnedKi > 0) {
          setOfflineKiEarned(earnedKi);
          setShowOfflinePopup(true);
        }
      } catch (e) {
        console.error("Failed to parse saved state", e);
        setBalanceKi(1000);
        setTotalKi(2500);
        const todayStamp = getLocalDayStamp();
        const weekStamp = getLocalWeekStamp();
        setQuestProgress(createFreshQuestProgress(todayStamp, weekStamp));
      }
    } else {
      setBalanceKi(1000);
      setTotalKi(2500);
      const todayStamp = getLocalDayStamp();
      const weekStamp = getLocalWeekStamp();
      setQuestProgress(createFreshQuestProgress(todayStamp, weekStamp));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const stateToSave: SavedGameState = {
      balanceKi,
      totalKi,
      energy,
      userCards,
      activeBoost,
      dragonBalls,
      claimedQuests,
      claimedQuestRewards,
      questRewardsCache,
      questProgress,
      unlockedSecretCards,
      permanentAchievements,
      lastActive: Date.now(),
    };
    localStorage.setItem("dragonBallKiState", JSON.stringify(stateToSave));
  }, [
    balanceKi,
    totalKi,
    energy,
    userCards,
    activeBoost,
    dragonBalls,
    claimedQuests,
    claimedQuestRewards,
    questRewardsCache,
    questProgress,
    unlockedSecretCards,
    permanentAchievements,
    isLoaded,
  ]);

  useEffect(() => {
    if (!activeBoost) return;
    const now = Date.now();
    if (now >= activeBoost.expiresAt) {
      setActiveBoost(null);
      return;
    }
    const timeout = setTimeout(() => {
      setActiveBoost(null);
    }, activeBoost.expiresAt - now);
    return () => clearTimeout(timeout);
  }, [activeBoost]);

  useEffect(() => {
    if (!isLoaded) return;
    const energyInterval = window.setInterval(() => {
      setEnergy((current) => Math.min(energyMax, current + 1));
    }, 1400);

    return () => window.clearInterval(energyInterval);
  }, [isLoaded, energyMax]);

  useEffect(() => {
    if (!isLoaded || passiveKiPerSecond <= 0) return undefined;

    const passiveInterval = window.setInterval(() => {
      setBalanceKi((current) => current + passiveKiPerSecond);
      setTotalKi((current) => current + passiveKiPerSecond);
    }, 1000);

    return () => window.clearInterval(passiveInterval);
  }, [isLoaded, passiveKiPerSecond]);

  useEffect(() => {
    if (!isLoaded) return;
    const dropInterval = window.setInterval(() => {
      if (Math.random() < 0.3 && !randomDrop) {
        setRandomDrop({
          id: Date.now().toString(),
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10,
          type:
            Math.random() > 0.6
              ? "energy"
              : Math.random() > 0.8
                ? "boost"
                : "ki",
        });
        setTimeout(() => setRandomDrop(null), 8000);
      }
    }, 60000);
    return () => window.clearInterval(dropInterval);
  }, [isLoaded, randomDrop]);

  const handleClickKi = () => {
    if (energy < 1) return;
    const gain = levelMultiplier * currentMultiplier;
    setBalanceKi((current) => current + gain);
    setTotalKi((current) => current + gain);
    setEnergy((current) => Math.max(0, current - 1));
    setQuestProgress((current) => {
      const nextTotalKi = current.totalKi + gain;
      return {
        ...current,
        clicks: current.clicks + 1,
        dailyCounters: {
          ...current.dailyCounters,
          clicks: current.dailyCounters.clicks + 1,
        },
        weeklyCounters: {
          ...current.weeklyCounters,
          clicks: current.weeklyCounters.clicks + 1,
        },
        totalKi: nextTotalKi,
        level: getLevelIndexByKi(nextTotalKi),
      };
    });
  };

  const handlePurchaseCard = (card: GameCard) => {
    const existing = userCards.find((item) => item.card_id === card.id);
    const currentLevel = existing ? existing.current_level : 0;
    const baseCost = Number(card?.base_cost) || 0;
    const cost =
      currentLevel > 0
        ? Math.floor(baseCost * Math.pow(1.5, currentLevel))
        : baseCost;

    if (balanceKi < cost) return false;

    setBalanceKi((current) => current - cost);
    setQuestProgress((current) => ({
      ...current,
      upgrades: current.upgrades + 1,
      dailyCounters: {
        ...current.dailyCounters,
        upgrades: current.dailyCounters.upgrades + 1,
      },
      weeklyCounters: {
        ...current.weeklyCounters,
        upgrades: current.weeklyCounters.upgrades + 1,
      },
      legendaryPurchase:
        String(card?.rarity || "").toLowerCase() === "legendary" &&
        currentLevel === 0
          ? current.legendaryPurchase + 1
          : current.legendaryPurchase,
    }));
    setUserCards((current) => {
      const existingInState = current.find((item) => item.card_id === card.id);
      if (!existingInState) {
        return [...current, { card_id: card.id, current_level: 1 }];
      }
      return current.map((item) =>
        item.card_id === card.id
          ? { ...item, current_level: item.current_level + 1 }
          : item,
      );
    });
    return true;
  };

  const handlePurchaseBoost = (boost: GameBoost) => {
    if (balanceKi < boost.cost) return;
    setBalanceKi((current) => current - boost.cost);

    if (boost.type === "energy_restore") {
      setEnergy(energyMax);
      return;
    }

    setActiveBoost({
      id: boost.id,
      multiplier: boost.multiplier,
      expiresAt: Date.now() + boost.durationMs,
    });
  };

  const handleCatchDrop = (drop: RandomDrop) => {
    setRandomDrop(null);
    if (drop.type === "ki") {
      const reward = levelMultiplier * 50;
      setBalanceKi((b) => b + reward);
      setTotalKi((t) => t + reward);
      setQuestProgress((current) => ({
        ...current,
        totalKi: current.totalKi + reward,
      }));
    } else if (drop.type === "energy") {
      setEnergy((e) => Math.min(energyMax, e + 50));
    } else if (drop.type === "boost") {
      setActiveBoost({
        id: "random-boost",
        multiplier: 3,
        expiresAt: Date.now() + 10000,
      });
    }
  };

  const handleClaimQuest = (quest: Quest) => {
    if (claimedQuests.includes(quest.id)) return;
    setBalanceKi((b) => b + quest.reward.ki);
    setTotalKi((t) => t + quest.reward.ki);
    const rewardEnergy = quest.reward.energy;
    if (typeof rewardEnergy === "number") {
      setEnergy((e) => Math.min(energyMax, e + rewardEnergy));
    }
    if (quest.reward.unlock) {
      setUnlockedSecretCards((current) => [
        ...new Set([...current, quest.reward.unlock as string]),
      ]);
      setPermanentAchievements((current) => [
        ...new Set([...current, quest.reward.unlock as string]),
      ]);
    }
    setClaimedQuests((prev) => [...prev, quest.id]);
    setClaimedQuestRewards((prev) => [...prev, quest.id]);
    setQuestRewardsCache((prev) => ({ ...prev, [quest.id]: true }));
  };

  const handlePrestige = () => {
    if (totalKi < GAME_CONSTANTS.PRESTIGE_REQ_KI) return;
    if (
      window.confirm(
        "Rebirth resets your Ki, Energy, cards, boosts, and non-permanent quest progress. You keep your Dragon Balls, permanent achievements, and any unlocked secret cards.",
      )
    ) {
      setDragonBalls((d) => d + 1);
      setBalanceKi(0);
      setTotalKi(0);
      setEnergy(GAME_CONSTANTS.ENERGY_MAX);
      setUserCards([]);
      setActiveBoost(null);
      setClaimedQuests([]);
      setClaimedQuestRewards([]);
      setQuestRewardsCache({});
      setQuestProgress((current) => ({
        ...current,
        clicks: 0,
        upgrades: 0,
        totalKi: 0,
        legendaryPurchase: 0,
        dailyCounters: { clicks: 0, upgrades: 0 },
        weeklyCounters: { clicks: 0, upgrades: 0 },
      }));
    }
  };

  const renderTabContent = () => {
    if (activeTab === "home") {
      return (
        <div className="flex w-full flex-1 items-center justify-center">
          <GokuClicker
            balanceKi={balanceKi}
            energy={energy}
            energyMax={energyMax}
            totalKi={totalKi}
            levelName={level.name}
            levelMultiplier={levelMultiplier}
            levelEmoji={level?.emoji}
            levelAura={level?.aura}
            levelImage={level?.image}
            dragonBalls={dragonBalls}
            onClickKi={handleClickKi}
            randomDrop={randomDrop}
            onCatchDrop={handleCatchDrop}
          />
        </div>
      );
    }

    if (activeTab === "mining") {
      return (
        <div className="flex w-full flex-1 items-center justify-center">
          <MiningStore
            cards={demoCards}
            userCards={userCards}
            balanceKi={balanceKi}
            onPurchaseCard={handlePurchaseCard}
            boosts={demoBoosts}
            activeBoost={activeBoost}
            onPurchaseBoost={handlePurchaseBoost}
          />
        </div>
      );
    }

    if (activeTab === "quests") {
      const filteredQuests = QUESTS.filter((q) => q.tab === questTab);
      return (
        <div className="flex w-full justify-center">
          <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
            <div className="rounded-3xl border border-white/5 bg-slate-900/50 p-6 backdrop-blur-md">
              <h3 className="text-xl font-black text-white mb-6 uppercase tracking-widest text-center shadow-black drop-shadow-md">
                Quests & Achievements
              </h3>

              <div className="flex bg-slate-950/50 p-1 rounded-xl mb-6">
                {(["daily", "weekly", "permanent"] as QuestTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setQuestTab(tab)}
                    className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
                      questTab === tab
                        ? "bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                {unlockedSecretCards.length > 0 && (
                  <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-4 backdrop-blur-md">
                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-cyan-300 mb-3">
                      Secret Unlocks
                    </h4>
                    <div className="space-y-2">
                      {unlockedSecretCards.map((item) => (
                        <div
                          key={item}
                          className="rounded-2xl border border-cyan-400/10 bg-slate-950/40 px-4 py-3 text-sm text-cyan-100"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {permanentAchievements.length > 0 && (
                  <div className="rounded-3xl border border-fuchsia-500/20 bg-fuchsia-500/10 p-4 backdrop-blur-md">
                    <h4 className="text-sm font-black uppercase tracking-[0.2em] text-fuchsia-300 mb-3">
                      Permanent Achievements
                    </h4>
                    <div className="space-y-2">
                      {permanentAchievements.map((item) => (
                        <div
                          key={item}
                          className="rounded-2xl border border-fuchsia-400/10 bg-slate-950/40 px-4 py-3 text-sm text-fuchsia-100"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {filteredQuests.length === 0 && (
                  <div className="text-center text-slate-500 text-xs py-8">
                    No quests available in this category.
                  </div>
                )}
                {filteredQuests.map((quest) => {
                  const isClaimed = claimedQuests.includes(quest.id);
                  const rewardKi = quest.reward.ki;
                  const rewardEnergy = quest.reward.energy;
                  const progress = getQuestProgressValue(quest);

                  const isCompleted = progress >= quest.target;
                  const percent = Math.max(
                    0,
                    Math.min(100, (progress / quest.target) * 100),
                  );

                  return (
                    <div
                      key={quest.id}
                      className="rounded-2xl border border-white/5 bg-slate-800/40 p-5 shadow-lg relative overflow-hidden flex flex-col"
                    >
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="flex gap-3 items-center">
                          <div className="text-3xl drop-shadow-lg scale-110 pl-1">
                            <quest.icon className="h-6 w-6 text-orange-300" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white tracking-tight">
                              {quest.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {quest.desc}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="inline-block px-2 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded text-[10px] font-black tracking-widest uppercase">
                            +{formatKi(rewardKi)} Ki
                            {rewardEnergy !== undefined
                              ? ` +${rewardEnergy} Energy`
                              : ""}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-auto relative z-10">
                        <div className="flex-1 relative h-2 bg-slate-900 rounded-full shadow-[inset_0_1px_3px_rgba(0,0,0,1)] border border-blue-500/10 flex items-center">
                          <div
                            className="absolute left-0 h-full bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.6)] transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                          <div
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-500 z-10"
                            style={{ left: `${Math.max(4, percent)}%` }}
                          >
                            <DragonBallIcon
                              stars={1}
                              className="w-4 h-4 drop-shadow-[0_0_10px_rgba(255,165,0,0.8)]"
                            />
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 w-16 text-right font-mono">
                          {formatKi(Math.floor(progress))} /{" "}
                          {formatKi(quest.target)}
                        </span>
                      </div>

                      {quest.reward.unlock && (
                        <div className="mt-4 text-[10px] font-bold uppercase tracking-widest text-cyan-300/90">
                          Secret Unlock: {quest.reward.unlock}
                        </div>
                      )}

                      {isCompleted && !isClaimed && (
                        <button
                          onClick={() => handleClaimQuest(quest)}
                          className="mt-4 w-full py-2.5 rounded-xl bg-orange-500 text-white text-xs font-black uppercase tracking-widest hover:bg-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.5)] transition-all active:scale-95 relative z-10 flex items-center justify-center gap-2"
                        >
                          <span>Claim Reward</span>
                          <span>🎁</span>
                        </button>
                      )}
                      {isClaimed && (
                        <div className="mt-4 text-center py-2 text-[10px] font-black tracking-widest text-green-500 uppercase bg-green-500/10 rounded-xl relative z-10">
                          Claimed
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === "wallet") {
      return (
        <div className="flex w-full justify-center">
          <div className="w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
            <div className="rounded-3xl border border-white/5 bg-slate-900/50 p-6 backdrop-blur-md">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    Wallet Balance
                  </p>
                  <p className="mt-2 text-3xl font-black text-white">
                    {Math.floor(balanceKi).toLocaleString()}{" "}
                    <span className="text-xl text-orange-400">Ki</span>
                  </p>
                </div>
                {dragonBalls > 0 && (
                  <div className="flex flex-col items-center">
                    <DragonBallIcon
                      stars={dragonBalls % 7 === 0 ? 7 : dragonBalls % 7}
                      className="w-12 h-12 drop-shadow-[0_0_20px_rgba(249,115,22,0.8)] animate-pulse"
                    />
                    <span className="text-[10px] font-bold text-orange-400 mt-1">
                      x{dragonBalls}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-6 rounded-2xl bg-slate-950/50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                  Passive Income
                </p>
                <p className="mt-1 text-lg font-bold text-green-400">
                  +{passiveKiPerSecond.toFixed(2)} Ki/s
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-orange-500/20 bg-gradient-to-b from-orange-500/10 to-transparent p-6 backdrop-blur-md text-center">
              <h3 className="text-lg font-bold text-orange-400 mb-2">
                Rebirth (Prestige)
              </h3>
              <p className="text-xs text-slate-300 mb-4">
                Rebirth resets your Ki, Energy, cards, boosts, and non-permanent
                quest progress. You keep Dragon Balls, permanent achievements,
                and unlocked secret cards.
              </p>
              <div className="flex justify-center items-center gap-2 mb-4">
                <DragonBallIcon
                  stars={
                    dragonBalls > 0
                      ? dragonBalls % 7 === 0
                        ? 7
                        : dragonBalls % 7
                      : 4
                  }
                  className="w-12 h-12 drop-shadow-[0_0_20px_rgba(249,115,22,0.8)] animate-pulse"
                />
                <div className="text-left ml-2">
                  <span className="block text-2xl font-black text-white">
                    {dragonBalls}
                  </span>
                  <span className="block text-[10px] font-bold uppercase tracking-widest text-orange-400">
                    Owned
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mb-4">
                Current Bonus: +{dragonBalls * 50}%
              </p>
              <button
                onClick={handlePrestige}
                disabled={totalKi < GAME_CONSTANTS.PRESTIGE_REQ_KI}
                className={`w-full py-3 rounded-xl font-bold uppercase tracking-wider transition-all ${
                  totalKi >= GAME_CONSTANTS.PRESTIGE_REQ_KI
                    ? "bg-orange-500 text-white hover:bg-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                {totalKi >= GAME_CONSTANTS.PRESTIGE_REQ_KI
                  ? "Rebirth Now"
                  : `Need ${formatKi(GAME_CONSTANTS.PRESTIGE_REQ_KI)} Total Ki`}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex w-full flex-1 items-center justify-center">
        <MiningStore
          cards={demoCards}
          userCards={userCards}
          balanceKi={balanceKi}
          onPurchaseCard={handlePurchaseCard}
          boosts={demoBoosts}
          activeBoost={activeBoost}
          onPurchaseBoost={handlePurchaseBoost}
        />
      </div>
    );
  };

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-[#050B14] flex items-center justify-center">
        <div className="animate-pulse text-orange-500 font-bold tracking-widest uppercase">
          Loading...
        </div>
      </main>
    );
  }

  return (
    <main
      className={`bg-[#050B14] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(249,115,22,0.15),rgba(255,255,255,0))] text-slate-200 font-sans selection:bg-orange-500/30 flex flex-col ${activeTab === "home" ? "h-[100dvh] overflow-hidden" : "min-h-screen pb-28 pt-6 px-4 overflow-auto"}`}
    >
      <div
        className={`mx-auto flex w-full max-w-md flex-col lg:max-w-5xl lg:flex-row lg:items-start flex-1 ${activeTab === "home" ? "h-full" : "gap-6"}`}
      >
        <div
          className={`flex w-full flex-col lg:w-1/2 lg:sticky lg:top-6 ${activeTab === "home" ? "h-full" : "gap-6"}`}
        >
          {activeTab !== "home" && (
            <header className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-orange-500">
                  Dragon Ball
                </p>
                <h1 className="text-2xl font-black tracking-tight text-white">
                  $Ki Battle
                </h1>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 border border-white/10">
                <span className="text-lg">🐉</span>
              </div>
            </header>
          )}

          {showOfflinePopup && (
            <div className="animate-in fade-in slide-in-from-top-4 flex items-center justify-between rounded-2xl border border-orange-500/20 bg-orange-500/10 p-4 backdrop-blur-sm">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-orange-400">
                  Welcome Back
                </p>
                <p className="text-sm font-medium text-orange-100 mt-0.5">
                  You earned{" "}
                  <span className="font-bold text-orange-400">
                    {offlineKiEarned} Ki
                  </span>{" "}
                  while away.
                </p>
              </div>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20 text-orange-300 transition-colors hover:bg-orange-500/30"
                onClick={() => setShowOfflinePopup(false)}
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex w-full flex-1 items-center justify-center">
            {renderTabContent()}
          </div>
        </div>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </main>
  );
}
