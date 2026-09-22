import React from 'react';
import { Tag, Sparkles } from 'lucide-react';
import { POPULAR_KEYWORDS } from '../data/videos';

interface PopularTagsProps {
  onSelectTag: (tag: string) => void;
  activeTag: string;
  onSoundTrigger: () => void;
}

export const PopularTags: React.FC<PopularTagsProps> = ({
  onSelectTag,
  activeTag,
  onSoundTrigger,
}) => {
  return (
    <div className="w-full bg-gradient-to-r from-amber-100/60 via-pink-100/40 to-indigo-100/50 dark:from-slate-900/80 dark:via-indigo-950/40 dark:to-slate-900/80 p-3 sm:p-4 rounded-2xl border border-amber-200/60 dark:border-indigo-900/50 shadow-xs">
      <div className="flex items-center gap-2 mb-2.5">
        <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
        <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-amber-200">
          الكلمات والوسوم السحرية الأكثر بحثاً:
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {POPULAR_KEYWORDS.map((item) => {
          const isActive = activeTag === item.tag;
          return (
            <button
              key={item.tag}
              onClick={() => {
                onSoundTrigger();
                onSelectTag(isActive ? '' : item.tag);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all transform active:scale-95 shadow-2xs ${
                isActive
                  ? 'bg-rose-500 text-white shadow-sm ring-2 ring-rose-300 dark:ring-rose-800 scale-105'
                  : 'bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 hover:bg-amber-100/80 dark:hover:bg-indigo-900/60'
              }`}
            >
              <span>{item.emoji}</span>
              <span>#{item.tag.replace(/\s+/g, '_')}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
