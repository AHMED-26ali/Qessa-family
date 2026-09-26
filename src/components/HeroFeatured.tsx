import React, { useState, useEffect } from 'react';
import { Play, Heart, Sparkles, Star, Clock, Youtube, RotateCcw, Share2, Check, Tv, ExternalLink } from 'lucide-react';
import { VideoStory } from '../types';
import { OFFICIAL_CHANNEL_URL } from '../data/videos';

interface HeroFeaturedProps {
  currentVideo: VideoStory;
  onSoundTrigger: () => void;
  isLatestUpload?: boolean;
  onRefreshLatest?: () => void;
  isSyncing?: boolean;
}

export const HeroFeatured: React.FC<HeroFeaturedProps> = ({
  currentVideo,
  onSoundTrigger,
  isLatestUpload = false,
  onRefreshLatest,
  isSyncing = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [cinemaLights, setCinemaLights] = useState(false);

  // Ensure videos NEVER play automatically: always reset to preview/thumbnail mode when selecting or switching stories
  useEffect(() => {
    setIsPlaying(false);
  }, [currentVideo.id]);

  const handleStartPlay = () => {
    onSoundTrigger();
    setIsPlaying(true);
  };

  const handleShare = () => {
    onSoundTrigger();
    const url = `https://www.youtube.com/watch?v=${currentVideo.id}`;
    if (navigator.share) {
      navigator.share({
        title: currentVideo.cleanTitle,
        text: currentVideo.description,
        url: url,
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  // Official YouTube Embed Configuration to ensure views & watch hours are fully tracked by YouTube Analytics
  const pageOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const pageHref = typeof window !== 'undefined' ? window.location.href : '';
  const officialYouTubeEmbedUrl = `https://www.youtube.com/embed/${currentVideo.id}?autoplay=1&enablejsapi=1&origin=${encodeURIComponent(pageOrigin)}&widget_referrer=${encodeURIComponent(pageHref)}&rel=0&playsinline=1`;

  return (
    <section className={`relative overflow-hidden rounded-2xl sm:rounded-3xl transition-all duration-500 ${
      cinemaLights
        ? 'bg-slate-950 text-white p-3 sm:p-8 shadow-2xl ring-4 ring-amber-400/40'
        : 'bg-gradient-to-br from-amber-100/70 via-rose-50/50 to-indigo-100/60 dark:from-slate-900 dark:via-indigo-950/50 dark:to-slate-950 p-3.5 sm:p-7 border sm:border-2 border-amber-200/80 dark:border-indigo-900/60 shadow-xl'
    }`}>
      
      {/* Whimsical Ambient Clouds in Background */}
      <div className="absolute -top-16 -right-16 w-44 sm:w-56 h-44 sm:h-56 bg-gradient-to-br from-amber-300/40 to-rose-300/30 dark:from-amber-500/10 dark:to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-48 sm:w-64 h-48 sm:h-64 bg-gradient-to-tr from-sky-300/30 to-indigo-300/30 dark:from-indigo-500/15 dark:to-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        
        {/* Top Control Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {isLatestUpload ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-black bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 text-white shadow-md">
                <Sparkles className="w-3.5 h-3.5 shrink-0 animate-twinkle" />
                <span>أحدث حلقة تم نشرها 🚀</span>
                <span className="hidden sm:inline-block text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-bold">
                  تتحدث تلقائياً مع كل فيديو جديد
                </span>
              </div>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-1 rounded-full text-[11px] sm:text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md">
                <Star className="w-3.5 h-3.5 fill-white shrink-0" />
                <span>الحلقة المختارة 🌟</span>
              </span>
            )}

            <span className="px-2.5 sm:px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-white/90 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700 shadow-2xs">
              {currentVideo.categoryNameAr}
            </span>

            <span className="hidden xs:inline-flex px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              آمن للأطفال {currentVideo.ageRecommendation}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Cinema Lights Mode Switcher */}
            <button
              type="button"
              onClick={() => {
                onSoundTrigger();
                setCinemaLights(!cinemaLights);
              }}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold transition shadow-2xs min-h-[32px] ${
                cinemaLights
                  ? 'bg-amber-400 text-slate-950 font-black'
                  : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-white'
              }`}
              title="إضاءة السينما للمشاهدة المركزة"
            >
              <Tv className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">إضاءة السينما</span>
            </button>

            {/* Direct Channel Link */}
            <a
              href={OFFICIAL_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="زيارة قناة قصة العائلة على يوتيوب"
              title="قناة قصة العائلة الرسمية على يوتيوب"
              className="inline-flex items-center gap-1 text-[11px] sm:text-xs font-bold text-red-600 dark:text-red-400 hover:underline px-1.5 sm:px-2 py-1 min-h-[32px]"
            >
              <Youtube className="w-3.5 h-3.5 fill-red-600 shrink-0" aria-hidden="true" />
              <span>زيارة قناة قصة العائلة على يوتيوب (@Qessa-family)</span>
            </a>
          </div>
        </div>

        {/* Video Player or High-Speed Mobile Thumbnail Facade */}
        <div className={`relative w-full aspect-video rounded-2xl sm:rounded-3xl overflow-hidden bg-black shadow-2xl transition-all duration-500 border-2 ${
          cinemaLights ? 'border-amber-400 shadow-amber-400/20' : 'border-white/90 dark:border-slate-800'
        }`}>
          {isPlaying ? (
            <iframe
              src={officialYouTubeEmbedUrl}
              title={currentVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="origin-when-cross-origin"
              className="w-full h-full border-0"
            />
          ) : (
            <div className="relative w-full h-full group cursor-pointer" onClick={handleStartPlay}>
              <img
                src={`https://img.youtube.com/vi/${currentVideo.id}/maxresdefault.jpg`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${currentVideo.id}/hqdefault.jpg`;
                }}
                alt={currentVideo.cleanTitle}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="eager"
              />

              {/* Radiant Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 group-hover:from-black/75 transition-all" />

              {/* Large Playful Play Button */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-2">
                <button
                  type="button"
                  aria-label="تشغيل الحكاية"
                  className="relative flex items-center justify-center w-16 h-16 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 hover:scale-110 active:scale-95 text-white shadow-2xl transition-transform duration-300 ring-4 ring-white/60 cursor-pointer"
                >
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white ml-1" />
                </button>
                <span className="text-white font-black text-xs sm:text-sm bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-center">
                  اضغط لبدء الحكاية الآن ▶
                </span>
              </div>

              {/* Bottom Badges */}
              <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 flex items-center gap-1.5 sm:gap-2">
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold bg-black/80 text-white backdrop-blur-md">
                  <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                  {currentVideo.duration}
                </span>
                <span className="px-2 py-1 rounded-xl text-[10px] sm:text-xs font-bold bg-rose-600 text-white shadow-md">
                  رسوم متحركة للأطفال
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Video Details Information and Controls */}
        <div className="mt-3.5 sm:mt-5 flex flex-col lg:flex-row lg:items-start justify-between gap-3 sm:gap-4">
          <div className="space-y-2 flex-1">
            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-800 dark:text-amber-100 leading-snug">
              {currentVideo.cleanTitle}
            </h2>
            <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              {currentVideo.description}
            </p>

            {/* Moral / Value of the Story with Cartoon Ribbon */}
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

          {/* Quick Action Buttons (Touch Friendly) */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full sm:w-auto shrink-0 pt-1">
            {/* Manual Play Story Button */}
            {!isPlaying && (
              <button
                type="button"
                onClick={handleStartPlay}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-black bg-gradient-to-r from-amber-500 via-rose-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white shadow-md shadow-rose-500/25 active:scale-95 transition min-h-[44px] cursor-pointer"
                title="بدء تشغيل الحكاية"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>تشغيل الحكاية</span>
              </button>
            )}

            {/* Direct Watch on YouTube button for 100% full view & watch hour attribution */}
            <a
              href={`https://www.youtube.com/watch?v=${currentVideo.id}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onSoundTrigger}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-black bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/25 active:scale-95 transition min-h-[44px] cursor-pointer"
              title="مشاهدة على تطبيق أو موقع يوتيوب الرسمي"
            >
              <Youtube className="w-4 h-4 fill-white shrink-0" aria-hidden="true" />
              <span>مشاهدة على YouTube</span>
              <ExternalLink className="w-3 h-3 opacity-80" aria-hidden="true" />
            </a>

            {/* Share / Copy Link Button */}
            <button
              type="button"
              onClick={handleShare}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-black bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition min-h-[44px] shadow-sm active:scale-95 cursor-pointer"
              title="مشاركة رابط الحكاية"
              aria-label="مشاركة"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              <span>{isCopied ? 'تم نسخ الرابط! ✓' : 'مشاركة الحكاية'}</span>
            </button>

            {/* Restart Button if Playing */}
            {isPlaying && (
              <button
                type="button"
                onClick={() => {
                  onSoundTrigger();
                  setIsPlaying(false);
                  setTimeout(() => setIsPlaying(true), 100);
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
