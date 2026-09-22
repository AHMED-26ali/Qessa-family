import React from 'react';
import { Home, Search, Heart, Bell, Moon, Sun } from 'lucide-react';
import { StoryCategory } from '../types';

interface MobileBottomNavProps {
  selectedCategory: StoryCategory;
  onGoHome: () => void;
  favoritesCount: number;
  onOpenFavorites: () => void;
  unreadNotifications: number;
  onOpenNotifications: () => void;
  isNightMode: boolean;
  onToggleNightMode: () => void;
  onFocusSearch: () => void;
  onSoundTrigger: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  selectedCategory,
  onGoHome,
  favoritesCount,
  onOpenFavorites,
  unreadNotifications,
  onOpenNotifications,
  isNightMode,
  onToggleNightMode,
  onFocusSearch,
  onSoundTrigger,
}) => {
  const isFavoritesActive = selectedCategory === 'favorites';
  const isHomeActive = selectedCategory !== 'favorites';

  return (
    <nav
      aria-label="شريط التنقل السريع للهاتف"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-amber-200/80 dark:border-indigo-950/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)] pb-safe transition-colors"
    >
      <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-1 items-center">
        
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
          <div className={`p-1 rounded-xl transition ${isHomeActive ? 'bg-amber-100 dark:bg-amber-950/60' : ''}`}>
            <Home className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5">الرئيسية</span>
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
          <div className="p-1 rounded-xl">
            <Search className="w-5 h-5" />
          </div>
          <span className="text-[10px] mt-0.5">بحث</span>
        </button>

        {/* 3. المفضلة */}
        <button
          type="button"
          onClick={() => {
            onSoundTrigger();
            onOpenFavorites();
          }}
          className={`relative flex flex-col items-center justify-center h-full min-h-[44px] transition active:scale-90 ${
            isFavoritesActive
              ? 'text-rose-500 font-black'
              : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <div className={`p-1 rounded-xl transition ${isFavoritesActive ? 'bg-rose-100 dark:bg-rose-950/60' : ''}`}>
            <Heart className={`w-5 h-5 ${isFavoritesActive ? 'fill-rose-500' : ''}`} />
          </div>
          {favoritesCount > 0 && (
            <span className="absolute top-1.5 right-4 px-1.5 min-w-[16px] h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-xs">
              {favoritesCount}
            </span>
          )}
          <span className="text-[10px] mt-0.5">مفضلاتي</span>
        </button>

        {/* 4. الإشعارات */}
        <button
          type="button"
          onClick={() => {
            onSoundTrigger();
            onOpenNotifications();
          }}
          className="relative flex flex-col items-center justify-center h-full min-h-[44px] text-slate-500 dark:text-slate-400 font-medium transition active:scale-90"
        >
          <div className="p-1 rounded-xl">
            <Bell className="w-5 h-5" />
          </div>
          {unreadNotifications > 0 && (
            <span className="absolute top-2 right-4 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
          )}
          <span className="text-[10px] mt-0.5">التنبيهات</span>
        </button>

        {/* 5. وضع النوم / نهار */}
        <button
          type="button"
          onClick={() => {
            onSoundTrigger();
            onToggleNightMode();
          }}
          className="flex flex-col items-center justify-center h-full min-h-[44px] text-slate-500 dark:text-slate-400 font-medium transition active:scale-90"
          title={isNightMode ? 'التبديل إلى الوضع النهاري' : 'تفعيل وضع النوم'}
        >
          <div className={`p-1 rounded-xl transition ${isNightMode ? 'bg-indigo-100 dark:bg-indigo-950/60 text-amber-300' : 'bg-amber-100 dark:bg-slate-800 text-amber-600'}`}>
            {isNightMode ? <Moon className="w-5 h-5 fill-amber-300" /> : <Sun className="w-5 h-5 fill-amber-500" />}
          </div>
          <span className="text-[10px] mt-0.5">{isNightMode ? 'نوم' : 'نهار'}</span>
        </button>

      </div>
    </nav>
  );
};
