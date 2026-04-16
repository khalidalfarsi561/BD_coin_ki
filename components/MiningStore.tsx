'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

const formatKi = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(Math.max(0, Math.floor(Number(value) || 0)));
};

const RARITY_DEFS = [
  {
    id: 'common',
    label: 'Common',
    glow: 'from-slate-500/10 to-transparent',
    badge: 'border-slate-500/30 text-slate-300',
    accent: 'text-slate-300',
    borderGlow: 'border-white/5',
    threshold: 0,
  },
  {
    id: 'rare',
    label: 'Rare',
    glow: 'from-blue-500/10 to-transparent',
    badge: 'border-blue-500/30 text-blue-300',
    accent: 'text-blue-300',
    borderGlow: 'border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]',
    threshold: 250,
  },
  {
    id: 'epic',
    label: 'Epic',
    glow: 'from-purple-500/10 to-transparent',
    badge: 'border-purple-500/30 text-purple-300',
    accent: 'text-purple-300',
    borderGlow: 'border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]',
    threshold: 1000,
  },
  {
    id: 'legendary',
    label: 'Legendary',
    glow: 'from-orange-500/10 to-transparent',
    badge: 'border-orange-500/30 text-orange-300',
    accent: 'text-orange-300',
    borderGlow: 'border-orange-400/50 shadow-[0_0_20px_rgba(249,115,22,0.4)]',
    threshold: 5000,
  },
];

const getFallbackRarity = (cost = 0) => {
  const value = Number(cost) || 0;
  let rarity = RARITY_DEFS[0];
  for (const entry of RARITY_DEFS) {
    if (value >= entry.threshold) rarity = entry;
  }
  return rarity;
};

const resolveRarity = (card: any) => {
  const raw = String(card.rarity || card.rarity_level || card.tier || '').trim().toLowerCase();
  const normalized = raw.replace(/\s+/g, '_');
  const explicit = RARITY_DEFS.find(
    (entry) => entry.id === normalized || entry.label.toLowerCase().replace(/\s+/g, '_') === normalized
  );
  return explicit || getFallbackRarity(card.base_cost);
};

interface MiningStoreProps {
  cards?: any[];
  userCards?: any[];
  balanceKi?: number;
  onPurchaseCard?: (card: any) => void;
  loadingText?: string;
  boosts?: any[];
  activeBoost?: any;
  onPurchaseBoost?: (boost: any) => void;
}

export default function MiningStore({
  cards = [],
  userCards = [],
  balanceKi = 0,
  onPurchaseCard,
  loadingText = 'Gathering Ki...',
  boosts = [],
  activeBoost = null,
  onPurchaseBoost,
}: MiningStoreProps) {
  const [storeTab, setStoreTab] = useState<'cards' | 'boosts'>('cards');
  const [sortBy, setSortBy] = useState<'cost' | 'income' | 'rarity'>('cost');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [justUpgraded, setJustUpgraded] = useState<string | null>(null);

  const handlePurchaseClick = (card: any) => {
    onPurchaseCard?.(card);
    setJustUpgraded(card.id);
    setTimeout(() => setJustUpgraded(null), 2000);
  };
  const ownedMap = useMemo(() => {
    const map = new Map();
    userCards.forEach((item) => {
      if (item?.card_id) map.set(item.card_id, item);
    });
    return map;
  }, [userCards]);

  const cardRows = useMemo(() => {
    const rows = cards.map((card) => {
      const owned = ownedMap.get(card.id);
      const level = owned?.current_level || 0;
      const incomePerHour = Number(card.base_income_per_hour) || 0;
      const incomePerSecond = incomePerHour / 3600;
      const baseCost = Number(card.base_cost) || 0;
      const cost = level > 0 ? Math.floor(baseCost * Math.pow(1.5, level)) : baseCost;
      const rarity = resolveRarity(card);
      return {
        ...card,
        owned,
        level,
        incomePerSecond,
        cost,
        rarity,
      };
    });

    return rows.sort((a, b) => {
      let valA, valB;
      if (sortBy === 'cost') {
        valA = a.cost; valB = b.cost;
      } else if (sortBy === 'income') {
        valA = a.incomePerSecond; valB = b.incomePerSecond;
      } else if (sortBy === 'rarity') {
        valA = a.rarity.threshold; valB = b.rarity.threshold;
      }
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [cards, ownedMap, sortBy, sortOrder]);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">Mining Store</h3>
          <p className="text-xs text-slate-400">Passive income generators</p>
      <p className="text-xs text-slate-400">Passive income generators</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Balance</p>
          <p className="text-sm font-bold text-orange-400">{formatKi(balanceKi)} Ki</p>
        </div>
      </div>

      <div className="flex items-center justify-between px-2 mb-2">
        <div className="flex gap-2">
          <button onClick={() => setStoreTab('cards')} className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${storeTab === 'cards' ? 'bg-orange-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>Cards</button>
          <button onClick={() => setStoreTab('boosts')} className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${storeTab === 'boosts' ? 'bg-orange-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}>Boosts</button>
        </div>
        {storeTab === 'cards' && (
          <div className="flex items-center gap-2">
            <select 
              className="bg-slate-800 text-xs text-slate-300 rounded px-2 py-1 border border-white/10 outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
            >
              <option value="cost">Sort by Cost</option>
              <option value="income">Sort by Income</option>
              <option value="rarity">Sort by Rarity</option>
            </select>
            <button 
              onClick={() => setSortOrder(o => o === 'asc' ? 'desc' : 'asc')}
              className="bg-slate-800 text-xs text-slate-300 rounded px-2 py-1 border border-white/10 hover:bg-slate-700 transition-colors"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        )}
      </div>

      {storeTab === 'cards' && (
        <div className="grid grid-cols-2 gap-4 sm:gap-5">
          <AnimatePresence>
            {cardRows.map((card) => {
          const canAfford = balanceKi >= card.cost;
          const isOwned = card.level > 0;
          const ownedLabel = isOwned ? `Lvl ${card.level}` : 'Not owned';

          return (
            <motion.article
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              key={card.id}
              className={`group relative overflow-hidden rounded-[28px] border bg-gradient-to-b ${card.rarity.glow} ${card.rarity.borderGlow} aspect-[3/4] shadow-[0_20px_60px_rgba(0,0,0,0.35)]`}
            >
              <AnimatePresence>
                {justUpgraded === card.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1.2 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 m-auto w-fit h-fit text-green-400 font-black text-lg drop-shadow-[0_0_10px_rgba(74,222,128,0.9)] pointer-events-none z-20"
                  >
                    UPGRADED!
                  </motion.div>
                )}
              </AnimatePresence>
              
              <div className="relative z-10 flex h-full flex-col">
                <div className="absolute right-3 top-3 z-20">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.22em] ${card.rarity.badge} bg-slate-950/70 backdrop-blur-md`}>
                    {card.rarity.label}
                  </span>
                </div>

                <div className="relative flex-1">
                  <div className={`absolute inset-0 bg-gradient-to-b ${card.rarity.glow}`} />
                  <div className={`absolute inset-0 bg-slate-950/20 ${!isOwned ? 'backdrop-blur-[1px] brightness-[0.45] saturate-0' : ''}`} />
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />

                  {card.image ? (
                    <img
                      src={card.image}
                      alt={card.name}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
                      <p className="max-w-[80%] text-center text-xs text-slate-300">{card.description}</p>
                    </div>
                  )}

                  {!isOwned && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/45">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white shadow-[0_0_25px_rgba(0,0,0,0.35)]">
                        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current stroke-[1.8]">
                          <path d="M7 11V8a5 5 0 0 1 10 0v3" />
                          <rect x="5" y="11" width="14" height="10" rx="2" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative z-10 -mt-12 rounded-[24px] border border-white/10 bg-slate-950/90 p-4 shadow-[0_-12px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                  <h4 className="text-sm font-black text-white line-clamp-1">{card.name}</h4>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-400">{card.description}</p>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-slate-500">Income</p>
                      <p className={`mt-0.5 text-sm font-black ${card.rarity.accent}`}>+{formatKi(card.incomePerSecond * (card.level || 1))}/s</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-slate-500">{isOwned ? 'Upgrade' : 'Buy'}</p>
                      <p className="mt-0.5 text-sm font-black text-orange-300">{formatKi(card.cost)} Ki</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handlePurchaseClick(card)}
                      disabled={!canAfford}
                      className={`flex-1 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] transition-all ${
                        canAfford
                          ? 'bg-orange-500 text-white hover:bg-orange-400 shadow-[0_0_18px_rgba(249,115,22,0.35)]'
                          : 'cursor-not-allowed border border-slate-700/60 bg-slate-800/60 text-slate-500 opacity-70'
                      }`}
                    >
                      {isOwned ? 'Upgrade' : 'Buy'}
                    </button>
                    <button
                      type="button"
                      disabled
                      className="rounded-xl border border-white/5 bg-white/5 px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-400"
                    >
                      {card.rarity.label}
                    </button>
                  </div>
                </div>
              </div>
            </motion.article>
          );
        })}
        </AnimatePresence>

        {cardRows.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center text-xs text-slate-400">
            {loadingText}
          </div>
        ) : null}
      </div>
      )}

      {storeTab === 'boosts' && (
        <div className="grid grid-cols-2 gap-4">
          {boosts.map(boost => {
            const canAfford = balanceKi >= boost.cost;
            const isActive = activeBoost?.id === boost.id;
            const isLocked = !canAfford && !isActive;
            return (
              <article key={boost.id} className={`group relative overflow-hidden rounded-[28px] border bg-gradient-to-b from-orange-500/15 to-slate-950/90 shadow-[0_20px_60px_rgba(0,0,0,0.35)] ${isLocked ? 'border-white/5' : 'border-orange-500/25'}`}>
                <div className="relative aspect-[3/4]">
                  {boost.image ? (
                    <img src={boost.image} alt={boost.name} className="absolute inset-0 h-full w-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90">
                      <span className="text-xs text-slate-400">{boost.description}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/10 to-slate-950/90" />
                  <div className="absolute right-3 top-3">
                    <span className="rounded-full border border-orange-400/30 bg-slate-950/70 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.22em] text-orange-300 backdrop-blur-md">
                      Boost
                    </span>
                  </div>
                  {isLocked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/55">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-black/30 text-white">
                        <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current stroke-[1.8]">
                          <path d="M7 11V8a5 5 0 0 1 10 0v3" />
                          <rect x="5" y="11" width="14" height="10" rx="2" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>

                <div className="relative z-10 -mt-12 rounded-[24px] border border-white/10 bg-slate-950/90 p-4 shadow-[0_-12px_30px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                  <h4 className="text-sm font-black text-white line-clamp-1">{boost.name}</h4>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-400">{boost.description}</p>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-slate-500">Effect</p>
                      <p className="mt-0.5 text-sm font-black text-orange-300">
                        {boost.type === 'energy_restore' ? 'Energy Restore' : `${boost.multiplier}x`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-slate-500">Cost</p>
                      <p className="mt-0.5 text-sm font-black text-white">{formatKi(boost.cost)} Ki</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => onPurchaseBoost?.(boost)}
                      disabled={!canAfford || !!activeBoost}
                      className={`flex-1 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-[0.22em] transition-all ${
                        isActive
                          ? 'bg-green-500 text-white shadow-[0_0_18px_rgba(34,197,94,0.35)]'
                          : canAfford && !activeBoost
                          ? 'bg-orange-500 text-white hover:bg-orange-400 shadow-[0_0_18px_rgba(249,115,22,0.35)]'
                          : 'cursor-not-allowed border border-slate-700/60 bg-slate-800/60 text-slate-500 opacity-70'
                      }`}
                    >
                      {isActive ? 'Active' : activeBoost ? 'Wait' : canAfford ? 'Buy' : 'Locked'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
