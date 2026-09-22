import React, { useState } from 'react';
import { Play, Heart, Sparkles, Star, Clock, Youtube, RotateCcw, Share2, Check, Tv } from 'lucide-react';
import { VideoStory } from '../types';
import { OFFICIAL_CHANNEL_URL } from '../data/videos';

interface HeroFeaturedProps {
  currentVideo: VideoStory;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSoundTrigger: () => void;
  isLatestUpload?: boolean;
}

export const HeroFeatured: React.FC<HeroFeaturedProps> = ({
  currentVideo,
  isFavorite,
  onToggleFavorite,
  onSoundTrigger,
  isLatestUpload = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [cinemaLights, setCinemaLights] = useState(false);

  const handleStartPlay = () => {
    onSoundTrigger();
    setIsPlaying(true);
  };

  const handleShare = () => {
    onSoundTrigger();
    const url = `https://www.youtube.com/watch?v=${currentVideo.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  return (
    <section className={`relative overflow-hidden rounded-3xl transition-all duration-500 ${
      cinemaLights
        ? 'bg-slate-950 text-white p-4 sm:p-8 shadow-2xl ring-4 ring-amber-400/40'
        : 'bg-gradient-to-br from-amber-100/70 via-rose-50/50 to-indigo-100/60 dark:from-slate-900 dark:via-indigo-950/50 dark:to-slate-950 p-4 sm:p-7 border-2 border-amber-200/80 dark:border-indigo-900/60 shadow-xl'
    }`}>
      
      {/* Whimsical Ambient Clouds / Lights in Background */}
      <div className="absolute -top-16 -right-16 w-56 h-56 bg-gradient-to-br from-amber-300/40 to-rose-300/30 dark:from-amber-500/10 dark:to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-sky-300/30 to-indigo-300/30 dark:from-indigo-500/15 dark:to-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        
        {/* Top Control Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3.5">
          <div className="flex flex-wrap items-center gap-2">
            {isLatestUpload ? (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md animate-bounce-slow">
                <Sparkles className="w-3.5 h-3.5" />
                أحدث حلقة نزلت على القناة! 🚀
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md">
                <Star className="w-3.5 h-3.5 fill-white" />
                الحلقة المختارة للعرض 🌟
              </span>
            )}

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/90 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700 shadow-2xs">
              {currentVideo.categoryNameAr}
            </span>

            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              آمن للأطفال {currentVideo.ageRecommendation}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Cinema Lights Mode Switcher */}
            <button
              onClick={() => {
                onSoundTrigger();
                setCinemaLights(!cinemaLights);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold transition shadow-2xs ${
                cinemaLights
                  ? 'bg-amber-400 text-slate-950'
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
              className="inline-flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 hover:underline px-2 py-1"
            >
              <Youtube className="w-4 h-4 fill-red-600" />
              <span>@Qessa-family</span>
            </a>
          </div>
        </div>

        {/* Video Player or High-Speed Mobile Thumbnail Facade */}
        <div className={`relative w-full aspect-video rounded-3xl overflow-hidden bg-black shadow-2xl transition-all duration-500 border-2 ${
          cinemaLights ? 'border-amber-400 shadow-amber-400/20' : 'border-white/90 dark:border-slate-800'
        }`}>
          {isPlaying ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${currentVideo.id}?autoplay=1&rel=0&modestbranding=1`}
              title={currentVideo.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
              loading="lazy"
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
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <button
                  type="button"
                  aria-label="تشغيل الحكاية"
                  className="relative flex items-center justify-center w-16 h-16 sm:w-22 sm:h-22 rounded-full bg-gradient-to-tr from-rose-500 via-pink-500 to-amber-400 hover:scale-110 active:scale-95 text-white shadow-2xl transition-transform duration-300 ring-4 ring-white/60"
                >
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white ml-1" />
                </button>
                <span className="text-white font-black text-xs sm:text-sm bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                  اضغط لبدء الحكاية الآن ▶
                </span>
              </div>

              {/* Bottom Badges */}
              <div className="absolute bottom-3 right-3 flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-black/80 text-white backdrop-blur-md">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {currentVideo.duration}
                </span>
                <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-rose-600 text-white shadow-md">
                  رسوم متحركة للأطفال
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Video Details Information and Controls */}
        <div className="mt-4 sm:mt-5 flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="space-y-2.5 flex-1">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-800 dark:text-amber-100 leading-snug">
              {currentVideo.cleanTitle}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              {currentVideo.description}
            </p>

            {/* Moral / Value of the Story with Cartoon Ribbon */}
            {currentVideo.moralLesson && (
              <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-200/50 dark:bg-amber-950/50 border border-amber-300/80 dark:border-amber-700/60 shadow-2xs">
                <div className="w-8 h-8 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center shrink-0 font-bold shadow-xs">
                  <Star className="w-4 h-4 fill-slate-900" />
                </div>
                <div className="text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-200">
                  <span className="font-black text-amber-900 dark:text-amber-300 ml-1">الدرس المستفاد من الحكاية:</span>
                  <span>{currentVideo.moralLesson}</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 self-start shrink-0 pt-1">
            {/* Favorite Button */}
            <button
              onClick={() => {
                onSoundTrigger();
                onToggleFavorite(currentVideo.id);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all shadow-md transform active:scale-95 ${
                isFavorite
                  ? 'bg-rose-500 text-white hover:bg-rose-600'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white text-white' : 'text-rose-500'}`} />
              <span>{isFavorite ? 'محفوظة في المفضلة' : 'أضف لقائمتي المفضلة'}</span>
            </button>

            {/* Restart Button if Playing */}
            {isPlaying && (
              <button
                onClick={() => {
                  onSoundTrigger();
                  setIsPlaying(false);
                  setTimeout(() => setIsPlaying(true), 100);
                }}
                className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                title="إعادة تشغيل الحكاية من الأول"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}

            {/* Share / Copy Link */}
            <button
              onClick={handleShare}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
              title="نسخ رابط الحكاية للمشاركة"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
