import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Heart, 
  Sparkles, 
  Star, 
  Clock, 
  Youtube, 
  RotateCcw, 
  Share2, 
  Check, 
  Tv, 
  ExternalLink,
  Gamepad2,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { VideoStory } from '../types';
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [cinemaLights, setCinemaLights] = useState(false);
  const [isPlayAlongOpen, setIsPlayAlongOpen] = useState(false);
  const [hasEmbedError, setHasEmbedError] = useState(false);

  // Always reset playback state when switching stories
  useEffect(() => {
    setIsPlaying(false);
    setHasEmbedError(false);
  }, [currentVideo.id]);

  const handleStartPlay = () => {
    onSoundTrigger();
    setHasEmbedError(false);
    setIsPlaying(true);
  };

  const handleShare = () => {
    onSoundTrigger();
    const url = `https://www.youtube.com/watch?v=${currentVideo.id}`;
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

  // Privacy-Enhanced YouTube Embed URL:
  // Using youtube-nocookie.com, rel=0, playsinline=1, enablejsapi=1, and origin
  // Note: NO autoplay=1 when loading the page; only loads after user explicit click
  const pageOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const officialYouTubeEmbedUrl = `https://www.youtube-nocookie.com/embed/${currentVideo.id}?autoplay=1&enablejsapi=1&origin=${encodeURIComponent(pageOrigin)}&rel=0&playsinline=1`;

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
                <span>الحكاية المختارة 🌟</span>
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
            <div className={`relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl transition-all duration-500 border-2 ${
              cinemaLights ? 'border-amber-400 shadow-amber-400/20' : 'border-white/90 dark:border-slate-800'
            }`}>
              {isPlaying && !hasEmbedError ? (
                <iframe
                  src={officialYouTubeEmbedUrl}
                  title={currentVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="origin-when-cross-origin"
                  className="w-full h-full border-0"
                  onError={() => setHasEmbedError(true)}
                />
              ) : hasEmbedError ? (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-slate-900 text-white text-center gap-2">
                  <AlertCircle className="w-10 h-10 text-amber-400" />
                  <h4 className="text-sm sm:text-base font-black">تعذر تضمين هذا الفيديو داخل الصفحة</h4>
                  <p className="text-xs text-slate-300 max-w-sm">
                    يمكنك مشاهدة الحكاية مباشرة وبجودة عالية عبر تطبيق أو موقع يوتيوب الرسمي:
                  </p>
                  <a
                    href={`https://www.youtube.com/watch?v=${currentVideo.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black shadow-md transition"
                  >
                    <Youtube className="w-4 h-4 fill-white" />
                    <span>فتح الحكاية على YouTube</span>
                  </a>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleStartPlay}
                  aria-label={`تشغيل حكاية ${currentVideo.cleanTitle}`}
                  className="relative block w-full h-full group cursor-pointer text-right"
                >
                  <img
                    src={`https://img.youtube.com/vi/${currentVideo.id}/maxresdefault.jpg`}
                    onError={(e) => {
                      const image = e.currentTarget;
                      // Avoid an infinite error loop if the fallback image is unavailable.
                      image.onerror = null;
                      image.src = `https://img.youtube.com/vi/${currentVideo.id}/hqdefault.jpg`;
                    }}
                    alt={currentVideo.cleanTitle}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="eager"
                  />

                  {/* Gradient shadow overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 group-hover:from-black/75 transition-all" />

                  {/* Large Child-Friendly Play Button */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-2">
                    <span
                      className="relative flex items-center justify-center w-16 h-16 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 group-hover:scale-110 group-active:scale-95 text-white shadow-2xl transition-transform duration-300 ring-4 ring-white/60"
                    >
                      <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white ml-1" />
                    </span>
                    <span className="text-white font-black text-xs sm:text-sm bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-center">
                      اضغط لبدء الحكاية الآن ▶
                    </span>
                  </div>

                  {/* Badges on Thumbnail */}
                  <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 flex items-center gap-1.5 sm:gap-2">
                    <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold bg-black/80 text-white backdrop-blur-md">
                      <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                      {currentVideo.duration}
                    </span>
                    <span className="px-2 py-1 rounded-xl text-[10px] sm:text-xs font-bold bg-rose-600 text-white shadow-md">
                      رسوم متحركة للأطفال
                    </span>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Play-Along Game Column (Split layout when enabled) */}
          {isPlayAlongOpen && (
            <div className="lg:col-span-5 flex flex-col">
              <PlayAlongGamePanel
                isOpen={isPlayAlongOpen}
                onClose={() => setIsPlayAlongOpen(false)}
                isVideoPlaying={isPlaying}
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
            
            {/* Play Button if not already playing */}
            {!isPlaying && (
              <button
                type="button"
                onClick={handleStartPlay}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white shadow-md active:scale-95 transition min-h-[44px] cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>تشغيل الحكاية</span>
              </button>
            )}

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

            {/* Direct Official YouTube Link */}
            <a
              href={`https://www.youtube.com/watch?v=${currentVideo.id}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onSoundTrigger}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-black bg-red-600 hover:bg-red-700 text-white shadow-md active:scale-95 transition min-h-[44px] cursor-pointer"
              title="مشاهدة على تطبيق أو موقع يوتيوب الرسمي"
            >
              <Youtube className="w-4 h-4 fill-white shrink-0" />
              <span>مشاهدة على YouTube</span>
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

            {/* Restart Button if Playing */}
            {isPlaying && (
              <button
                type="button"
                onClick={() => {
                  onSoundTrigger();
                  setIsPlaying(false);
                  setTimeout(() => setIsPlaying(true), 150);
                }}
                className="p-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition min-w-[44px] min-h-[44px] flex items-center justify-center active:scale-90 cursor-pointer"
                title="إعادة تشغيل الحكاية من الأول"
                aria-label="إعادة التشغيل"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

          </div>
        </div>

      </div>
    </section>
  );
};
