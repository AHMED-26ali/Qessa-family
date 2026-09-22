import React, { useState } from 'react';
import { Sparkles, Heart, Search, Film, ArrowUpDown, Star } from 'lucide-react';
import { VideoStory, StoryCategory } from '../types';
import { VideoCard } from './VideoCard';

interface VideoGridProps {
  videos: VideoStory[];
  featuredVideos: VideoStory[];
  activeVideoId: string;
  favorites: string[];
  selectedCategory: StoryCategory;
  searchQuery: string;
  activeTag: string;
  onSelectVideo: (video: VideoStory) => void;
  onToggleFavorite: (id: string) => void;
  onSoundTrigger: () => void;
  onResetCategory: () => void;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  videos,
  featuredVideos,
  activeVideoId,
  favorites,
  selectedCategory,
  searchQuery,
  activeTag,
  onSelectVideo,
  onToggleFavorite,
  onSoundTrigger,
  onResetCategory,
}) => {
  const [sortBy, setSortBy] = useState<'default' | 'views'>('default');

  const displayedVideos = [...videos].sort((a, b) => {
    if (sortBy === 'views') {
      const getNum = (v: string) => parseInt(v.replace(/[^0-9]/g, '')) || 0;
      return getNum(b.viewsApprox) - getNum(a.viewsApprox);
    }
    return 0;
  });

  return (
    <div className="space-y-8 sm:space-y-12">
      
      {/* 1. قسم الحلقات المميزة (Shown when on 'all' without search/tags) */}
      {selectedCategory === 'all' && !searchQuery && !activeTag && featuredVideos.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-rose-400 text-slate-950 flex items-center justify-center font-black shadow-md">
                <Star className="w-5 h-5 fill-slate-950" />
              </div>
              <div>
                <h3 className="text-lg sm:text-2xl font-black text-slate-800 dark:text-amber-100 flex items-center gap-1.5">
                  <span>أحدث الحلقات المميزة والأكثر تفاعلاً</span>
                  <span className="text-amber-500">✨</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  حكايات كرتونية حازت على إعجاب آلاف الأطفال والعائلات
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {featuredVideos.slice(0, 3).map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                isActive={video.id === activeVideoId}
                isFavorite={favorites.includes(video.id)}
                onSelect={onSelectVideo}
                onToggleFavorite={onToggleFavorite}
                onSoundTrigger={onSoundTrigger}
              />
            ))}
          </div>
        </section>
      )}

      {/* 2. Main Story Library */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-amber-200/60 dark:border-slate-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-black shadow-md">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-2xl font-black text-slate-800 dark:text-amber-100 flex items-center gap-2">
                <span>
                  {selectedCategory === 'favorites'
                    ? 'قائمتي المفضلة ❤️'
                    : activeTag
                    ? `الحكايات المتعلقة بـ #${activeTag}`
                    : searchQuery
                    ? `نتائج البحث عن: "${searchQuery}"`
                    : 'مكتبة الحكايات والكرتون'}
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 font-bold">
                  {displayedVideos.length} حكاية
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                جميع الحلقات مأخوذة مباشرة من قناة قصة العائلة الرسمية
              </p>
            </div>
          </div>

          {/* Quick Sort Switcher */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => {
                onSoundTrigger();
                setSortBy(sortBy === 'default' ? 'views' : 'default');
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-amber-400 transition shadow-2xs"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-amber-500" />
              <span>{sortBy === 'views' ? 'الأكثر مشاهدة' : 'أحدث الحلقات'}</span>
            </button>
          </div>
        </div>

        {/* Video Cards Grid */}
        {displayedVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayedVideos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                isActive={video.id === activeVideoId}
                isFavorite={favorites.includes(video.id)}
                onSelect={onSelectVideo}
                onToggleFavorite={onToggleFavorite}
                onSoundTrigger={onSoundTrigger}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-14 sm:py-20 text-center rounded-3xl bg-white/70 dark:bg-slate-900/50 border-2 border-dashed border-amber-300/80 dark:border-slate-800 p-6 shadow-sm">
            {selectedCategory === 'favorites' ? (
              <div className="max-w-md mx-auto space-y-3.5">
                <div className="w-20 h-20 mx-auto rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center shadow-inner">
                  <Heart className="w-10 h-10 fill-rose-500 animate-bounce-slow" />
                </div>
                <h4 className="text-xl font-black text-slate-800 dark:text-amber-100">
                  قائمتك المفضلة بانتظارك!
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                  اضغط على علامة القلب (❤️) الموجودة على أي حكاية لحفظها هنا والرجوع إليها في أي وقت.
                </p>
                <button
                  onClick={() => {
                    onSoundTrigger();
                    onResetCategory();
                  }}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-sm shadow-md transition transform active:scale-95"
                >
                  استكشف الحكايات الممتعة 🌟
                </button>
              </div>
            ) : (
              <div className="max-w-md mx-auto space-y-3.5">
                <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center shadow-inner">
                  <Search className="w-10 h-10" />
                </div>
                <h4 className="text-xl font-black text-slate-800 dark:text-amber-100">
                  لم نجد حكايات مطابقة لبحثك
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                  جرب اختيار تصنيف من الأعلى أو ابحث بكلمة أخرى مثل "سندريلا"، "الأميرة"، "الكلب بولت".
                </p>
                <button
                  onClick={() => {
                    onSoundTrigger();
                    onResetCategory();
                  }}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-sm shadow-md transition transform active:scale-95"
                >
                  عرض جميع الحكايات 🌈
                </button>
              </div>
            )}
          </div>
        )}
      </section>

    </div>
  );
};
