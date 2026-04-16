'use client';

import { Home, Pickaxe, Target, Wallet } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'mining', label: 'Mining', icon: Pickaxe },
  { id: 'quests', label: 'Quests', icon: Target },
  { id: 'wallet', label: 'Wallet', icon: Wallet },
];

export default function BottomNav({ activeTab = 'home', onTabChange }: { activeTab: string, onTabChange: (id: string) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-4 pb-4 sm:px-6 sm:pb-6 pointer-events-none">
      <div className="mx-auto max-w-md rounded-2xl border border-white/10 bg-slate-950/80 p-1.5 shadow-2xl backdrop-blur-xl pointer-events-auto">
        <div className="grid grid-cols-4 gap-1">
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange?.(item.id)}
                aria-current={active ? 'page' : undefined}
                className={`group flex flex-col items-center justify-center gap-1 rounded-xl py-2 px-1 transition-all duration-200 ${
                  active
                    ? 'bg-orange-500/10 text-orange-400'
                    : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-200 ${active ? 'scale-110' : 'scale-100 group-hover:scale-110'}`} strokeWidth={active ? 2.5 : 2} />
                <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
