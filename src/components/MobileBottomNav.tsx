import React from 'react';
import { Home, Search, Heart, Bell, Moon, Sun } from 'lucide-react';
import { StoryCategory } from '../types';

interface MobileBottomNavProps {
  selectedCategory: StoryCategory;
  onGoHome: () => void;
  isNightMode: boolean;
  onToggleNightMode: () => void;
  onFocusSearch: () => void;
  onSoundTrigger: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  selectedCategory,
  onGoHome,
  isNightMode,
  onToggleNightMode,
  onFocusSearch,
  onSoundTrigger,
}) => {
  const isHomeActive = selectedCategory !== 'favorites';

  return (
    <nav
      aria-label="شريط التنقل السريع للهاتف"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-amber-200/80 dark:border-indigo-950/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)] pb-safe transition-colors"
    >
      <div className="grid grid-cols-3 h-16 max-w-sm mx-auto px-4 items-center">
        
        {/* 1. الرئيسية */}
        <button
          type="button"
          onClick={() => {
            onSoundTrigger();
            onGoHome();
          }}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition active:scale-90 ${
            isHomeActive
              ? 'text-amber-600 dark:text-amber-400 font-black'
              : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <div className={`p-1.5 rounded-xl transition ${isHomeActive ? 'bg-amber-100 dark:bg-amber-950/60' : ''}`}>
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5 font-bold">الرئيسية</span>
        </button>

        {/* 2. البحث */}
        <button
          type="button"
          onClick={() => {
            onSoundTrigger();
            onFocusSearch();
          }}
          className="flex flex-col items-center justify-center h-full min-h-[44px] text-slate-500 dark:text-slate-400 font-medium transition active:scale-90"
        >
          <div className="p-1.5 rounded-xl">
            <Search className="w-5 h-5" />
          </div>
          <span className="text-[11px] mt-0.5 font-bold">بحث الحكايات</span>
        </button>

        {/* 3. وضع النوم / نهار */}
        <button
          type="button"
          onClick={() => {
            onSoundTrigger();
            onToggleNightMode();
          }}
          className="flex flex-col items-center justify-center h-full min-h-[44px] text-slate-500 dark:text-slate-400 font-medium transition active:scale-90"
          title={isNightMode ? 'التبديل إلى الوضع النهاري' : 'تفعيل وضع النوم'}
        >
          <div className={`p-1.5 rounded-xl transition ${isNightMode ? 'bg-indigo-100 dark:bg-indigo-950/60 text-amber-300' : 'bg-amber-100 dark:bg-slate-800 text-amber-600'}`}>
            {isNightMode ? <Moon className="w-5 h-5 fill-amber-300" /> : <Sun className="w-5 h-5 fill-amber-500" />}
          </div>
          <span className="text-[11px] mt-0.5 font-bold">{isNightMode ? 'وضع النوم 🌙' : 'النهار ☀️'}</span>
        </button>

      </div>
    </nav>
  );
};
