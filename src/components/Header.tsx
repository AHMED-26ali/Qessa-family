import React from 'react';
import { Moon, Sun, Heart, Bell, Youtube, Search, Sparkles, Volume2, VolumeX, ShieldCheck } from 'lucide-react';
import { OFFICIAL_CHANNEL_URL } from '../data/videos';

interface HeaderProps {
  isNightMode: boolean;
  onToggleNightMode: () => void;
  favoritesCount: number;
  onOpenFavorites: () => void;
  onOpenNotifications: () => void;
  unreadNotifications: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSoundTrigger: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isNightMode,
  onToggleNightMode,
  favoritesCount,
  onOpenFavorites,
  onOpenNotifications,
  unreadNotifications,
  soundEnabled,
  onToggleSound,
  searchQuery,
  onSearchChange,
  onSoundTrigger,
}) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border-b border-amber-200/80 dark:border-indigo-950/80 shadow-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Channel Brand Identity */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            <div className="relative group cursor-pointer" onClick={onSoundTrigger}>
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-rose-400 to-indigo-500 shadow-md transform transition duration-300 group-hover:scale-105 group-hover:rotate-3">
                <img
                  src="/logo.jpg"
                  alt="لوجو قصة العائلة"
                  className="w-full h-full object-cover rounded-full bg-slate-900"
                />
              </div>
              <span className="absolute -bottom-1 -left-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[9px] text-white items-center justify-center font-bold">★</span>
              </span>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-amber-100 tracking-tight flex items-center gap-1 font-['Baloo_Bhaijaan_2']">
                  <span>قصة العائلة</span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  محتوى آمن 100% للأطفال
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                حكايات ورسوم متحركة قبل النوم
              </p>
            </div>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-sm mx-4">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="ابحث عن حدوتة، أميرة، أو حيوان..."
                className="w-full pl-8 pr-10 py-2 rounded-2xl text-xs sm:text-sm bg-slate-100/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 border border-transparent transition shadow-inner"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute left-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Interactive Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Sound Toggle */}
            <button
              onClick={() => {
                onToggleSound();
                onSoundTrigger();
              }}
              className={`p-2 rounded-xl transition active:scale-90 ${
                soundEnabled
                  ? 'bg-amber-100 dark:bg-slate-800 text-amber-700 dark:text-amber-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
              title={soundEnabled ? 'كتم المؤثرات الصوتية' : 'تشغيل المؤثرات الصوتية للأزرار'}
              aria-label="المؤثرات الصوتية"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            {/* Subscribe to YouTube Button */}
            <a
              href={OFFICIAL_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onSoundTrigger}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-2xl text-xs font-black text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 active:scale-95 shadow-md hover:shadow-lg transition-all"
              title="زيارة قناة قصة العائلة على يوتيوب والاشتراك"
            >
              <Youtube className="w-4 h-4 fill-white" />
              <span className="hidden sm:inline">اشترك بالقناة</span>
              <span className="sm:hidden">اشترك</span>
            </a>

            {/* Notifications Button */}
            <button
              onClick={() => {
                onSoundTrigger();
                onOpenNotifications();
              }}
              className="relative p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-90"
              title="تنبيهات الحلقات الجديدة"
              aria-label="تنبيهات الحلقات الجديدة"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifications > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>

            {/* Favorites Button */}
            <button
              onClick={() => {
                onSoundTrigger();
                onOpenFavorites();
              }}
              className="relative p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition active:scale-90"
              title="مفضلاتي من الحكايات"
              aria-label="مفضلاتي من الحكايات"
            >
              <Heart className="w-5 h-5 fill-rose-500" />
              {favoritesCount > 0 && (
                <span className="absolute -top-1 -right-1 px-1.5 min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                  {favoritesCount}
                </span>
              )}
            </button>

            {/* Day / Bedtime Night Mode Switcher */}
            <button
              onClick={() => {
                onSoundTrigger();
                onToggleNightMode();
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl text-xs font-black transition-all shadow-xs ${
                isNightMode
                  ? 'bg-gradient-to-r from-indigo-900 to-purple-900 text-amber-200 border border-indigo-700/80 hover:brightness-110 shadow-indigo-950/50'
                  : 'bg-gradient-to-r from-amber-200 to-amber-300 text-amber-950 border border-amber-300 hover:brightness-105 shadow-amber-200/50'
              }`}
              title={isNightMode ? 'التبديل إلى الوضع النهاري المبهج' : 'تفعيل وضع النوم لراحة عيون الأطفال'}
            >
              {isNightMode ? (
                <>
                  <Moon className="w-4 h-4 fill-amber-300 text-amber-300 animate-spin-slow" />
                  <span className="hidden md:inline">وضع النوم 🌙</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-800 fill-amber-500" />
                  <span className="hidden md:inline">نهار مشرق ☀️</span>
                </>
              )}
            </button>

          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="mt-2.5 md:hidden">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="ابحث عن حدوتة أو بطل كرتوني..."
              className="w-full pl-8 pr-10 py-2 rounded-2xl text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 border border-transparent transition shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute left-3 top-2.5 text-xs text-slate-400"
              >
                ✕
              </button>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
