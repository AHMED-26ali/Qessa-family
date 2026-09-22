import React from 'react';
import { CATEGORIES_LIST } from '../data/videos';
import { StoryCategory } from '../types';

interface CategoriesFilterProps {
  selectedCategory: StoryCategory;
  onSelectCategory: (cat: StoryCategory) => void;
  categoryCounts: Record<StoryCategory, number>;
  onSoundTrigger: () => void;
}

export const CategoriesFilter: React.FC<CategoriesFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  onSoundTrigger,
}) => {
  return (
    <div className="w-full my-4 sm:my-6">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-amber-100 flex items-center gap-2">
          <span>تصنيفات الحكايات الممتعة</span>
          <span className="text-xs font-bold text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900">
            اختر نوع الحكاية 🎈
          </span>
        </h3>
      </div>

      {/* Horizontal Scrollable Categories Container */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-2 scrollbar-none touch-pan-x">
        {CATEGORIES_LIST.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = categoryCounts[cat.id] || 0;

          return (
            <button
              key={cat.id}
              onClick={() => {
                onSoundTrigger();
                onSelectCategory(cat.id);
              }}
              className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all duration-200 transform active:scale-95 border-2 shadow-xs ${
                isSelected
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 border-amber-600 shadow-md scale-105 ring-2 ring-amber-300 dark:ring-amber-700'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200/90 dark:border-slate-700 hover:border-amber-400 dark:hover:border-amber-500 hover:bg-amber-50/50'
              }`}
            >
              <span className="text-lg sm:text-xl drop-shadow-xs">{cat.emoji}</span>
              <span>{cat.name}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-black ${
                  isSelected
                    ? 'bg-slate-950/15 text-slate-950'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
