import React, { useState } from 'react';
import { 
  Heart, 
  Sparkles, 
  Star, 
  Youtube, 
  Share2, 
  Check, 
  Tv, 
  ExternalLink,
  Gamepad2,
  RefreshCw,
} from 'lucide-react';
import { VideoStory } from '../types';
import { playerUrl, storyPath } from '../site';
import { PlayAlongGamePanel } from './games/PlayAlongGamePanel';

interface HeroFeaturedProps {
  currentVideo: VideoStory;
  onSoundTrigger: () => void;
  isLatestUpload?: boolean;
  onRefreshLatest?: () => void;
  isSyncing?: boolean;
  lastSyncedText?: string;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenGamesWorld: () => void;
}

export const HeroFeatured: React.FC<HeroFeaturedProps> = ({
  currentVideo,
  onSoundTrigger,
  isLatestUpload = false,
  onRefreshLatest,
  isSyncing = false,
  lastSyncedText,
  isFavorite,
  onToggleFavorite,
  onOpenGamesWorld,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [cinemaLights, setCinemaLights] = useState(false);
  const [isPlayAlongOpen, setIsPlayAlongOpen] = useState(false);

  const handleShare = () => {
    onSoundTrigger();
    const url = new URL(storyPath(currentVideo.id), window.location.origin).href;
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: currentVideo.cleanTitle,
        text: currentVideo.description,
        url: url,
      }).catch(() => {});
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    <section className={`relative overflow-hidden rounded-2xl sm:rounded-3xl transition-all duration-500 ${
      cinemaLights
        ? 'bg-slate-950 text-white p-3 sm:p-7 shadow-2xl ring-4 ring-amber-400/40'
        : 'bg-gradient-to-br from-amber-100/70 via-rose-50/50 to-indigo-100/60 dark:from-slate-900 dark:via-indigo-950/50 dark:to-slate-950 p-3.5 sm:p-7 border sm:border-2 border-amber-200/80 dark:border-indigo-900/60 shadow-xl'
    }`}>
      
      {/* Whimsical Ambient Clouds */}
      <div className="absolute -top-16 -right-16 w-44 sm:w-56 h-44 sm:h-56 bg-gradient-to-br from-amber-300/40 to-rose-300/30 dark:from-amber-500/10 dark:to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-48 sm:w-64 h-48 sm:h-64 bg-gradient-to-tr from-sky-300/30 to-indigo-300/30 dark:from-indigo-500/15 dark:to-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        
        {/* Top Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {isLatestUpload ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-black bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white shadow-md">
                <Sparkles className="w-3.5 h-3.5 shrink-0 animate-twinkle" />
                <span>أحدث حلقة تم نشرها 🚀</span>
              </div>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md">
                <Star className="w-3.5 h-3.5 fill-white shrink-0" />
                <span>من آخر تحديث محفوظ</span>
              </span>
            )}

            <span className="px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-white/90 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700 shadow-2xs">
              {currentVideo.categoryNameAr}
            </span>

            <span className="hidden xs:inline-flex px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              مناسب للأطفال {currentVideo.ageRecommendation}
            </span>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Refresh Channel Button */}
            {onRefreshLatest && (
              <button
                type="button"
                onClick={onRefreshLatest}
                disabled={isSyncing}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-white shadow-2xs transition cursor-pointer disabled:opacity-60"
                title={lastSyncedText ? `آخر مزامنة: ${lastSyncedText}` : 'فحص قناة يوتيوب للبحث عن قصص جديدة'}
              >
                <RefreshCw className={`w-3.5 h-3.5 text-amber-500 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">
                  {isSyncing ? 'جاري الفحص...' : 'تحديث القصص'}
                </span>
              </button>
            )}

            {/* Play-along toggle button */}
            <button
              type="button"
              onClick={() => {
                onSoundTrigger();
                setIsPlayAlongOpen(!isPlayAlongOpen);
              }}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[11px] sm:text-xs font-black shadow-2xs transition cursor-pointer ${
                isPlayAlongOpen
                  ? 'bg-rose-500 text-white'
                  : 'bg-amber-400 hover:bg-amber-500 text-slate-950'
              }`}
              title="العب لعبة تفاعلية أثناء الاستماع للقصة"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>{isPlayAlongOpen ? 'إخفاء اللعبة' : 'العب واستمع 🎮'}</span>
            </button>

            {/* Cinema Lights Toggle */}
            <button
              type="button"
              onClick={() => {
                onSoundTrigger();
                setCinemaLights(!cinemaLights);
              }}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold transition shadow-2xs min-h-[32px] cursor-pointer ${
                cinemaLights
                  ? 'bg-amber-400 text-slate-950 font-black'
                  : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-white'
              }`}
              title="إضاءة السينما"
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">إضاءة السينما</span>
            </button>
          </div>
        </div>

        {/* Main Grid: Supports Split View when Play-Along is active */}
        <div className={`grid gap-4 ${isPlayAlongOpen ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
          
          {/* Video Player Column */}
          <div className={isPlayAlongOpen ? 'lg:col-span-7' : 'w-full'}>
            <div className={`relative w-full aspect-video min-h-[200px] rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl transition-all duration-500 border-2 ${
              cinemaLights ? 'border-amber-400 shadow-amber-400/20' : 'border-white/90 dark:border-slate-800'
            }`}>
              <iframe
                key={currentVideo.id}
                src={playerUrl(currentVideo.id)}
                title={currentVideo.cleanTitle}
                allow="encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                className="block w-full h-full border-0"
              />
            </div>
          </div>

          {/* Play-Along Game Column (Split layout when enabled) */}
          {isPlayAlongOpen && (
            <div className="lg:col-span-5 flex flex-col">
              <PlayAlongGamePanel
                isOpen={isPlayAlongOpen}
                onClose={() => setIsPlayAlongOpen(false)}
                onOpenFullGamesHub={onOpenGamesWorld}
              />
            </div>
          )}

        </div>

        {/* Video Story Info Details */}
        <div className="mt-3.5 sm:mt-5 flex flex-col lg:flex-row lg:items-start justify-between gap-3 sm:gap-4">
          <div className="space-y-2 flex-1">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-800 dark:text-amber-100 leading-snug">
              {currentVideo.cleanTitle}
            </h2>
            <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              {currentVideo.description}
            </p>

            {/* Moral lesson */}
            {currentVideo.moralLesson && (
              <div className="flex items-center gap-2 sm:gap-2.5 p-2.5 sm:p-3 rounded-2xl bg-amber-200/50 dark:bg-amber-950/50 border border-amber-300/80 dark:border-amber-700/60 shadow-2xs">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center shrink-0 font-bold shadow-xs">
                  <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-slate-900" />
                </div>
                <div className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200">
                  <span className="font-black text-amber-900 dark:text-amber-300 ml-1">الدرس المستفاد:</span>
                  <span>{currentVideo.moralLesson}</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto shrink-0 pt-1">
            
            {/* Favorite Button */}
            <button
              type="button"
              onClick={() => {
                onSoundTrigger();
                onToggleFavorite(currentVideo.id);
              }}
              className={`flex items-center justify-center gap-1.5 px-3.5 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-black transition min-h-[44px] shadow-sm cursor-pointer ${
                isFavorite
                  ? 'bg-rose-500 text-white shadow-rose-500/40'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
              }`}
              title={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
              <span>{isFavorite ? 'في المفضلة ❤️' : 'المفضلة'}</span>
            </button>

            <a
              href={storyPath(currentVideo.id)}
              className="flex items-center px-3 text-xs sm:text-sm font-bold text-rose-700 dark:text-rose-300 hover:underline min-h-[44px]"
            >
              اقرأ عن الحدوتة
            </a>

            {/* Direct Official YouTube Link */}
            <a
              href={`https://www.youtube.com/watch?v=${currentVideo.id}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onSoundTrigger}
              className="flex items-center gap-1.5 px-3 text-xs sm:text-sm font-bold text-rose-700 dark:text-rose-300 hover:underline min-h-[44px]"
              title="مشاهدة على تطبيق أو موقع يوتيوب الرسمي"
            >
              <Youtube className="w-4 h-4 fill-white shrink-0" />
              <span>فتح في YouTube</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </a>

            {/* Share Button */}
            <button
              type="button"
              onClick={handleShare}
              className="p-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-90 cursor-pointer shadow-sm"
              title="مشاركة رابط الحكاية"
              aria-label="مشاركة"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>

          </div>
        </div>

      </div>
    </section>
  );
};
