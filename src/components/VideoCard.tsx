import React from 'react';
import { Play, Heart, Clock, Sparkles, ShieldCheck } from 'lucide-react';
import { VideoStory } from '../types';

interface VideoCardProps {
  video: VideoStory;
  isActive: boolean;
  isFavorite: boolean;
  onSelect: (video: VideoStory) => void;
  onToggleFavorite: (id: string) => void;
  onSoundTrigger: () => void;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  isActive,
  isFavorite,
  onSelect,
  onToggleFavorite,
  onSoundTrigger,
}) => {
  return (
    <div
      onClick={() => {
        onSoundTrigger();
        onSelect(video);
      }}
      className={`group relative flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border-2 transition-all duration-300 cursor-pointer shadow-xs hover:shadow-xl transform hover:-translate-y-1 active:scale-[0.98] ${
        isActive
          ? 'border-amber-400 dark:border-amber-500 ring-4 ring-amber-400/30'
          : 'border-slate-100 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700'
      }`}
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
        <img
          src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
          alt={video.cleanTitle}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-106"
        />

        {/* Gradient shadow overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/30 opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Duration Badge */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-xl text-[10px] sm:text-[11px] font-black bg-black/80 text-white backdrop-blur-md shadow-xs">
          <Clock className="w-3 h-3 text-amber-400" />
          <span>{video.duration}</span>
        </div>

        {/* 100% Safe Badge */}
        <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] sm:text-[10px] font-black bg-emerald-600/90 text-white backdrop-blur-xs shadow-xs">
          <ShieldCheck className="w-3 h-3" />
          <span>آمن 100%</span>
        </div>

        {/* Favorite Heart Button with comfortable 44px touch target on mobile */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSoundTrigger();
            onToggleFavorite(video.id);
          }}
          className={`absolute top-1.5 left-1.5 w-11 h-11 rounded-full flex items-center justify-center transition-transform duration-200 active:scale-75 shadow-md ${
            isFavorite
              ? 'bg-rose-500 text-white shadow-rose-500/40'
              : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 hover:text-rose-500 hover:scale-105'
          }`}
          title={isFavorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
          aria-label="المفضلة"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white text-white' : ''}`} />
        </button>

        {/* Central Play Badge */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 sm:group-hover:opacity-100 transition-all duration-300 pointer-events-none">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-xl transform transition-transform group-hover:scale-110 ring-4 ring-white/50">
            <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-white ml-1" />
          </div>
        </div>
      </div>

      {/* Card Info Content */}
      <div className="p-3 sm:p-4 flex flex-col flex-1 justify-between gap-2 bg-gradient-to-b from-transparent to-amber-50/20 dark:to-slate-900/40">
        <div>
          <div className="flex items-center justify-between gap-1.5 mb-1.5">
            <span className="text-[10px] sm:text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              {video.categoryNameAr}
            </span>
            {video.isFeatured && (
              <span className="text-[10px] font-black text-rose-500 flex items-center gap-0.5 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-rose-500" /> مميز
              </span>
            )}
          </div>

          <h4 className="text-xs sm:text-base font-black text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-rose-600 dark:group-hover:text-amber-400 transition-colors">
            {video.cleanTitle}
          </h4>
        </div>

        {/* Card Footer Button */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] sm:text-xs">
          <span className="text-slate-400 font-medium">{video.viewsApprox} مشاهدة</span>
          <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-black group-hover:translate-x-[-2px] transition-transform">
            <span>تشغيل</span>
            <span>←</span>
          </span>
        </div>
      </div>
    </div>
  );
};
