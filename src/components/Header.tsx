import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Moon, Sun, Heart, Bell, Youtube, Search, Sparkles, Volume2, VolumeX, ShieldCheck, Play, Share2, Check } from 'lucide-react';
import { OFFICIAL_CHANNEL_URL } from '../data/videos';
import { VideoStory } from '../types';
import { matchesSearchQuery } from '../utils/search';

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
  videos?: VideoStory[];
  onSelectVideo?: (video: VideoStory) => void;
  onSearchSubmit?: () => void;
  onOpenWelcome?: () => void;
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
  videos = [],
  onSelectVideo,
  onSearchSubmit,
  onOpenWelcome,
}) => {
  const mobileInputRef = useRef<HTMLInputElement>(null);
  const desktopSearchRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] = useState(false);
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target as Node)) {
        setIsDesktopDropdownOpen(false);
      }
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target as Node)) {
        setIsMobileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Filter matching stories for instant search preview
  const matchingStories = useMemo(() => {
    if (!searchQuery.trim() || !videos.length) return [];
    return videos.filter((video) =>
      matchesSearchQuery(
        [video.cleanTitle, video.title, video.description, video.moralLesson, video.categoryNameAr],
        searchQuery
      )
    );
  }, [videos, searchQuery]);

  // Execute full search and smoothly scroll down to library
  const handlePerformSearch = () => {
    setIsDesktopDropdownOpen(false);
    setIsMobileDropdownOpen(false);
    onSoundTrigger();
    if (onSearchSubmit) {
      onSearchSubmit();
    } else {
      const el = document.getElementById('stories-library');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Native Web Share Sheet for the YouTube Channel
  const [copiedShare, setCopiedShare] = useState(false);

  const handleShareChannel = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onSoundTrigger();

    const shareData = {
      title: 'قصة العائلة | Qessa Family',
      text: 'شاهد أجمل حكايات وقصص الأطفال والرسوم المتحركة الهادفة على قناة قصة العائلة الرسمية! 🎬🌟',
      url: OFFICIAL_CHANNEL_URL,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return;
        }
      }
    }

    // Fallback: Copy to clipboard
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(OFFICIAL_CHANNEL_URL);
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2500);
      }
    } catch {}
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border-b border-amber-200/80 dark:border-indigo-950/80 shadow-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Channel Brand Identity */}
          <div className="flex items-center gap-2 sm:gap-3.5 shrink-0">
            <button
              type="button"
              className="relative group cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 rounded-full"
              onClick={() => {
                onSoundTrigger();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              title="قصة العائلة - الصفحة الرئيسية"
              aria-label="قصة العائلة - الصفحة الرئيسية"
            >
              <div className="w-10 h-10 sm:w-13 sm:h-13 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-rose-400 to-indigo-500 shadow-md transform transition duration-300 group-hover:scale-105 group-hover:rotate-3">
                <img
                  src="/logo.jpg"
                  alt="لوجو قصة العائلة"
                  className="w-full h-full object-cover rounded-full bg-slate-900"
                />
              </div>
              <span className="absolute -bottom-0.5 -left-0.5 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-500 text-[8px] text-white items-center justify-center font-bold">★</span>
              </span>
            </button>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <h1 className="text-lg sm:text-2xl font-black text-slate-800 dark:text-amber-100 tracking-tight flex items-center gap-1 font-['Baloo_Bhaijaan_2'] leading-none">
                  <span>قصة العائلة</span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  محتوى آمن 100%
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                <span>حكايات ورسوم متحركة للأطفال</span>
              </p>
            </div>
          </div>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-sm mx-4">
            <div ref={desktopSearchRef} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  setIsDesktopDropdownOpen(true);
                }}
                onFocus={() => {
                  if (searchQuery.trim()) setIsDesktopDropdownOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handlePerformSearch();
                  } else if (e.key === 'Escape') {
                    setIsDesktopDropdownOpen(false);
                  }
                }}
                placeholder="ابحث عن حدوتة، أميرة، أو حيوان..."
                aria-label="ابحث عن حدوتة أو شخصية كرتونية"
                className="w-full pl-8 pr-10 py-2.5 rounded-2xl text-xs sm:text-sm bg-slate-100/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 border border-transparent transition shadow-inner"
              />
              <button
                type="button"
                onClick={handlePerformSearch}
                title="اضغط للبحث في المكتبة"
                aria-label="بحث في المكتبة"
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-amber-500 absolute right-1.5 top-1.5 rounded-xl transition cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>

              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange('');
                    setIsDesktopDropdownOpen(false);
                  }}
                  className="absolute left-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  aria-label="مسح البحث"
                >
                  ✕
                </button>
              )}

              {/* Desktop Live Autocomplete / Search Dropdown */}
              {isDesktopDropdownOpen && searchQuery.trim().length > 0 && (
                <div className="absolute top-full mt-2 w-full right-0 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-amber-200/80 dark:border-indigo-950/80 z-50 overflow-hidden text-right">
                  <div className="px-3 py-2 bg-amber-50/80 dark:bg-slate-800/80 border-b border-amber-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    <span>نتائج فورية ({matchingStories.length})</span>
                    <span className="text-amber-600 dark:text-amber-400 text-[10px]">اضغط للمشاهدة فوراً</span>
                  </div>

                  {matchingStories.length > 0 ? (
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                      {matchingStories.slice(0, 4).map((video) => (
                        <button
                          key={video.id}
                          type="button"
                          onClick={() => {
                            if (onSelectVideo) onSelectVideo(video);
                            setIsDesktopDropdownOpen(false);
                            onSoundTrigger();
                          }}
                          className="w-full text-right p-2.5 flex items-center gap-3 hover:bg-amber-50/60 dark:hover:bg-slate-800 transition group cursor-pointer"
                        >
                          <img
                            src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                            alt={video.cleanTitle}
                            className="w-13 h-9 object-cover rounded-lg shrink-0 shadow-2xs group-hover:scale-105 transition"
                            loading="lazy"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-amber-600 dark:group-hover:text-amber-400">
                              {video.cleanTitle}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                              <span className="font-semibold text-amber-600 dark:text-amber-400">{video.categoryNameAr}</span>
                              <span>•</span>
                              <span>{video.duration}</span>
                            </div>
                          </div>
                          <Play className="w-3.5 h-3.5 text-rose-500 shrink-0 opacity-0 group-hover:opacity-100 transition" />
                        </button>
                      ))}

                      <div className="p-2 bg-gradient-to-r from-amber-500 to-rose-500 text-center">
                        <button
                          type="button"
                          onClick={handlePerformSearch}
                          className="w-full py-1.5 text-xs font-black text-white hover:brightness-110 flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <span>عرض كل النتائج في المكتبة ({matchingStories.length} حكاية)</span>
                          <span>⬇️</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center space-y-2.5">
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        لم نجد حكايات مطابقة لـ "{searchQuery}"
                      </p>
                      <p className="text-[11px] text-slate-400">
                        جرّب أحد الكلمات الشائعة التالية:
                      </p>
                      <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                        {['بولت', 'سندريلا', 'روبنسون', 'أميرات', 'حيوانات', 'نوم'].map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => {
                              onSearchChange(tag);
                              setIsDesktopDropdownOpen(true);
                              onSoundTrigger();
                            }}
                            className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-amber-100 dark:bg-slate-800 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-slate-700 transition cursor-pointer"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Interactive Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            
            {/* Sound Toggle (Available on all devices) */}
            <button
              type="button"
              onClick={() => {
                onToggleSound();
                onSoundTrigger();
              }}
              className={`p-2.5 rounded-xl transition active:scale-90 min-w-[40px] min-h-[40px] flex items-center justify-center ${
                soundEnabled
                  ? 'bg-amber-100 dark:bg-slate-800 text-amber-700 dark:text-amber-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}
              title={soundEnabled ? 'كتم المؤثرات الصوتية' : 'تشغيل المؤثرات الصوتية'}
              aria-label="المؤثرات الصوتية"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            {/* YouTube Channel & Share Buttons */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <a
                href={OFFICIAL_CHANNEL_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onSoundTrigger}
                aria-label="قناة قصة العائلة على يوتيوب - اضغط للاشتراك ومتابعة الحكايات"
                title="زيارة قناة قصة العائلة على يوتيوب والاشتراك"
                className="group relative inline-flex items-center gap-2 px-2.5 sm:px-3.5 py-2 rounded-2xl text-[11px] sm:text-xs font-black text-white bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 active:scale-95 shadow-md hover:shadow-lg transition-all min-h-[40px]"
              >
                {/* Gradient Glow Aura around the YouTube Icon */}
                <div className="relative flex items-center justify-center shrink-0">
                  <span
                    className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-amber-300 via-rose-400 to-red-500 blur-xs opacity-80 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300 animate-pulse pointer-events-none"
                    aria-hidden="true"
                  />
                  <span className="relative z-10 flex items-center justify-center w-5 h-5 rounded-full bg-red-700/80 border border-white/40 shadow-xs">
                    <Youtube className="w-3.5 h-3.5 fill-white text-white shrink-0 drop-shadow-xs" aria-hidden="true" />
                  </span>
                </div>
                <span className="font-bold relative z-10">اشترك في القناة</span>
              </a>

              {/* Native Share Sheet Button */}
              <button
                type="button"
                onClick={handleShareChannel}
                aria-label="مشاركة رابط قناة قصة العائلة مع الأصدقاء والعائلة"
                title={copiedShare ? 'تم نسخ الرابط بنجاح!' : 'مشاركة رابط القناة مع العائلة والأصدقاء'}
                className={`relative p-2 sm:p-2.5 rounded-2xl border transition active:scale-90 min-w-[38px] sm:min-w-[40px] min-h-[38px] sm:min-h-[40px] flex items-center justify-center cursor-pointer shadow-2xs ${
                  copiedShare
                    ? 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/20'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-800 hover:bg-rose-50/50 dark:hover:bg-slate-700/60'
                }`}
              >
                {copiedShare ? (
                  <Check className="w-4 h-4 text-white" aria-hidden="true" />
                ) : (
                  <Share2 className="w-4 h-4 shrink-0" aria-hidden="true" />
                )}
                <span className="sr-only">مشاركة القناة</span>

                {/* Copied Floating Toast */}
                {copiedShare && (
                  <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-bold whitespace-nowrap shadow-md z-30 animate-in fade-in">
                    تم نسخ الرابط!
                  </span>
                )}
              </button>
            </div>

            {/* Desktop Only Bedtime Night Mode Switcher */}
            <div className="hidden md:flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onSoundTrigger();
                  onToggleNightMode();
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-black transition-all shadow-xs min-h-[40px] ${
                  isNightMode
                    ? 'bg-gradient-to-r from-indigo-900 to-purple-900 text-amber-200 border border-indigo-700/80 hover:brightness-110 shadow-indigo-950/50'
                    : 'bg-gradient-to-r from-amber-200 to-amber-300 text-amber-950 border border-amber-300 hover:brightness-105 shadow-amber-200/50'
                }`}
                title={isNightMode ? 'التبديل إلى الوضع النهاري المبهج' : 'تفعيل وضع النوم لراحة عيون الأطفال'}
              >
                {isNightMode ? (
                  <>
                    <Moon className="w-4 h-4 fill-amber-300 text-amber-300 animate-spin-slow" />
                    <span>وضع النوم 🌙</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 text-amber-800 fill-amber-500" />
                    <span>نهار مشرق ☀️</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Search Input with easy clear button & live preview */}
        <div className="mt-2 md:hidden">
          <div ref={mobileSearchRef} className="relative w-full">
            <input
              id="mobile-search-input"
              ref={mobileInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                setIsMobileDropdownOpen(true);
              }}
              onFocus={() => {
                if (searchQuery.trim()) setIsMobileDropdownOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handlePerformSearch();
                } else if (e.key === 'Escape') {
                  setIsMobileDropdownOpen(false);
                }
              }}
              placeholder="ابحث عن حدوتة، أميرة، أو حيوان..."
              aria-label="ابحث عن حدوتة أو شخصية كرتونية"
              className="w-full pl-9 pr-10 py-2.5 rounded-2xl text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 border border-transparent transition shadow-inner"
            />
            <button
              type="button"
              onClick={handlePerformSearch}
              title="اضغط للبحث في المكتبة"
              aria-label="بحث في المكتبة"
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-amber-500 absolute right-1.5 top-1.5 rounded-xl transition cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>

            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  setIsMobileDropdownOpen(false);
                  mobileInputRef.current?.focus();
                }}
                className="absolute left-2.5 top-2 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 p-1.5 min-w-[28px] min-h-[28px] flex items-center justify-center"
                aria-label="مسح البحث"
              >
                ✕
              </button>
            )}

            {/* Mobile Live Autocomplete / Search Dropdown */}
            {isMobileDropdownOpen && searchQuery.trim().length > 0 && (
              <div className="absolute top-full mt-2 w-full right-0 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-amber-200/80 dark:border-indigo-950/80 z-50 overflow-hidden text-right">
                <div className="px-3 py-2 bg-amber-50/80 dark:bg-slate-800/80 border-b border-amber-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  <span>نتائج فورية ({matchingStories.length})</span>
                  <span className="text-amber-600 dark:text-amber-400 text-[10px]">اضغط للمشاهدة فوراً</span>
                </div>

                {matchingStories.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                    {matchingStories.slice(0, 4).map((video) => (
                      <button
                        key={video.id}
                        type="button"
                        onClick={() => {
                          if (onSelectVideo) onSelectVideo(video);
                          setIsMobileDropdownOpen(false);
                          onSoundTrigger();
                        }}
                        className="w-full text-right p-2 flex items-center gap-2.5 hover:bg-amber-50/60 dark:hover:bg-slate-800 transition group"
                      >
                        <img
                          src={`https://img.youtube.com/vi/${video.id}/mqdefault.jpg`}
                          alt={video.cleanTitle}
                          className="w-12 h-8 object-cover rounded-lg shrink-0 shadow-2xs"
                          loading="lazy"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[11px] font-bold text-slate-800 dark:text-slate-100 truncate">
                            {video.cleanTitle}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[9px] text-slate-400">
                            <span className="font-semibold text-amber-600 dark:text-amber-400">{video.categoryNameAr}</span>
                            <span>•</span>
                            <span>{video.duration}</span>
                          </div>
                        </div>
                      </button>
                    ))}

                    <div className="p-2 bg-gradient-to-r from-amber-500 to-rose-500 text-center">
                      <button
                        type="button"
                        onClick={handlePerformSearch}
                        className="w-full py-1.5 text-xs font-black text-white hover:brightness-110 flex items-center justify-center gap-1 transition"
                      >
                        <span>عرض كل النتائج في المكتبة ({matchingStories.length} حكاية) ⬇️</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 text-center space-y-2">
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                      لم نجد حكايات مطابقة لـ "{searchQuery}"
                    </p>
                    <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                      {['بولت', 'سندريلا', 'روبنسون', 'أميرات', 'حيوانات'].map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => {
                            onSearchChange(tag);
                            setIsMobileDropdownOpen(true);
                            onSoundTrigger();
                          }}
                          className="px-2 py-0.5 rounded-xl text-[10px] font-bold bg-amber-100 dark:bg-slate-800 text-amber-800 dark:text-amber-300 hover:bg-amber-200 transition"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
