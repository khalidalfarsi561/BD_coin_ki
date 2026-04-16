'use client';

import { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import DragonBallIcon from '@/components/DragonBallIcon';

const formatKi = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(Math.max(0, Math.floor(Number(value) || 0)));
};

interface GokuClickerProps {
  balanceKi?: number;
  energy?: number;
  energyMax?: number;
  totalKi?: number;
  levelName?: string;
  levelMultiplier?: number;
  levelEmoji?: string;
  levelAura?: string;
  levelImage?: string;
  dragonBalls?: number;
  onClickKi?: (count: number) => void;
  loadingText?: string;
  randomDrop?: { id: string, x: number, y: number, type: 'ki' | 'energy' | 'boost' } | null;
  onCatchDrop?: (drop: any) => void;
}

export default function GokuClicker({
  balanceKi = 0,
  energy = 100,
  energyMax = 100,
  totalKi = 0,
  levelName = 'Earthling',
  levelMultiplier = 1,
  levelEmoji = '🧑',
  levelAura = 'shadow-white/10',
  levelImage,
  dragonBalls = 0,
  onClickKi,
  loadingText = 'Gathering Ki...',
  randomDrop = null,
  onCatchDrop,
}: GokuClickerProps) {
  const [floaters, setFloaters] = useState<{ id: string; x: number; y: number; value: string }[]>([]);

  const energyPercent = useMemo(
    () => Math.max(0, Math.min(100, (energy / energyMax) * 100)),
    [energy, energyMax]
  );

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      if (!onClickKi) return;
      const kiGain = levelMultiplier;
      const rect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      setFloaters((current) => [
        ...current,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          x,
          y,
          value: `+${formatKi(kiGain)}`,
        },
      ]);

      onClickKi(1);

      window.setTimeout(() => {
        setFloaters((current) => current.slice(1));
      }, 900);
    },
    [levelMultiplier, onClickKi]
  );

  const isDisabled = energy <= 0;
  const isLowEnergy = energy > 0 && energy <= Math.max(10, energyMax * 0.1);

  return (
    <section className="relative flex h-full w-full flex-col items-center justify-between overflow-hidden px-4 pb-6 pt-3 sm:px-6 sm:pb-8 sm:pt-4">
      {/* Ambient background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,146,60,0.08),transparent_60%)] pointer-events-none" />
      
      {/* Header Stats */}
      <div className="relative z-10 flex w-full max-w-sm items-start justify-between self-start pt-0">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-orange-400/80">Level</p>
          <h2 className="mt-0.5 flex items-center gap-2 text-lg font-bold tracking-tight text-white sm:text-xl">
            {levelName}
            {dragonBalls > 0 && (
              <span className="flex items-center gap-1 rounded-full border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-xs text-orange-400">
                <DragonBallIcon stars={dragonBalls % 7 === 0 ? 7 : dragonBalls % 7} className="h-3.5 w-3.5" /> x{dragonBalls}
              </span>
            )}
          </h2>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Balance</p>
          <p className="mt-0.5 text-2xl font-black text-orange-400 drop-shadow-[0_0_15px_rgba(249,115,22,0.6)]">{formatKi(balanceKi)}</p>
        </div>
      </div>

      {/* Clicker Button Container - Expanded in middle */}
      <div className="relative z-10 flex w-full flex-1 max-w-sm items-center justify-center py-4 sm:py-6">
        <div className="relative flex h-60 w-60 items-center justify-center sm:h-72 sm:w-72">
          {/* Pulsing rings */}
          <div className="absolute inset-0 animate-ping rounded-full border border-orange-500/20 opacity-50 duration-1000 pointer-events-none" />
          <div className="absolute inset-4 rounded-full border border-orange-400/10 pointer-events-none" />
          
          <button
            type="button"
            onClick={handleClick}
            disabled={isDisabled}
            className={`relative z-10 flex h-52 w-52 items-center justify-center rounded-full bg-slate-800 transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:grayscale sm:h-64 sm:w-64 ${levelAura} shadow-[0_0_50px_rgba(249,115,22,0.2)]`}
          >
            <div className="absolute inset-1 overflow-hidden rounded-full border-2 border-white/10 bg-slate-900 flex items-center justify-center">
              {levelImage ? (
                <img src={levelImage} alt={levelName} className="h-full w-full object-cover opacity-90 scale-105" />
              ) : (
                <span className="text-6xl drop-shadow-lg sm:text-7xl">{levelEmoji}</span>
              )}
            </div>
            <div className="pointer-events-none relative mt-28 flex flex-col items-center sm:mt-36">
              <span className="rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-orange-100/90 backdrop-blur-md shadow-lg">+{formatKi(levelMultiplier)} Ki</span>
            </div>
          </button>

          <AnimatePresence>
            {randomDrop && (
              <motion.button
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: [1, 1.2, 1] }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.5, scale: { repeat: Infinity, duration: 1 } }}
                onClick={(e) => { e.stopPropagation(); onCatchDrop?.(randomDrop); }}
                className="absolute z-30 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-yellow-300 to-orange-500 shadow-[0_0_30px_rgba(250,204,21,0.8)] border-2 border-white cursor-pointer"
                style={{ left: `${randomDrop.x}%`, top: `${randomDrop.y}%` }}
              >
                <span className="text-2xl">{randomDrop.type === 'energy' ? '⚡' : randomDrop.type === 'boost' ? '🔥' : '⭐'}</span>
              </motion.button>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {floaters.map((floater) => (
              <motion.span
                key={floater.id}
                initial={{ opacity: 0, y: 0, scale: 0.8 }}
                animate={{ opacity: 1, y: -100, scale: 1.4 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="pointer-events-none absolute z-20 text-2xl font-black text-white drop-shadow-[0_2px_15px_rgba(249,115,22,0.9)]"
                style={{ left: floater.x - 20, top: floater.y - 20 }}
              >
                {floater.value}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Stats and Energy */}
      <div className="relative z-10 w-full max-w-sm space-y-4 self-end pb-1">
        {/* Energy Bar */}
        <div>
          <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-widest text-slate-400">
            <span>Energy</span>
            <span className="text-orange-400">{Math.floor(energy)} / {energyMax}</span>
          </div>
          {(isDisabled || isLowEnergy) && (
            <p className={`mb-2 text-[11px] leading-4 ${isDisabled ? 'text-orange-300' : 'text-slate-400'}`}>
              {isDisabled ? 'Energy empty — wait for recharge or visit Mining for passive income.' : 'Low energy — recharge soon or use a restore boost.'}
            </p>
          )}
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800 border border-white/5 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-600 via-orange-400 to-yellow-400 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(249,115,22,0.8)]"
              style={{ width: `${energyPercent}%` }}
            />
          </div>
        </div>

        {/* Mini Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-2.5 text-center backdrop-blur-md shadow-lg">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">Total Ki</p>
            <p className="mt-1 text-sm font-black text-slate-200">{formatKi(totalKi)}</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-2.5 text-center backdrop-blur-md shadow-lg">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">Multiplier</p>
            <p className="mt-1 text-sm font-black text-slate-200">x{formatKi(levelMultiplier)}</p>
          </div>
          <div className="rounded-2xl border border-white/5 bg-slate-900/60 p-2.5 text-center backdrop-blur-md shadow-lg bg-gradient-to-t from-slate-900/60 to-transparent">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-500">Status</p>
            <p className={`mt-1 text-xs font-black uppercase tracking-wider ${isDisabled ? 'text-slate-500 animate-pulse' : 'text-green-400 text-shadow-sm shadow-green-400/50'}`}>
              {isDisabled ? 'Recharging' : 'Ready'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
