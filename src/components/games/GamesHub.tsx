import React, { useState } from 'react';
import { 
  Gamepad2, 
  Brain, 
  Puzzle, 
  Search, 
  Palette, 
  Crown, 
  TreePine, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Star,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { MemoryGame } from './MemoryGame';
import { PuzzleGame } from './PuzzleGame';
import { SpotDifferenceGame } from './SpotDifferenceGame';
import { ColoringGame } from './ColoringGame';
import { StoryQuizGame } from './StoryQuizGame';
import { MagicForestRunner } from './MagicForestRunner';

interface GamesHubProps {
  soundEnabled: boolean;
  onPlaySound?: () => void;
  defaultGameId?: string;
}

export type ActiveGameId = 'memory' | 'puzzle' | 'spot' | 'coloring' | 'quiz' | 'runner';

const GAMES_CATALOG = [
  {
    id: 'memory' as ActiveGameId,
    title: 'لعبة الذاكرة',
    subtitle: 'مطابقة البطاقات',
    icon: Brain,
    emoji: '🧠',
    color: 'from-amber-400 to-orange-500',
    borderColor: 'border-amber-300 dark:border-amber-700',
  },
  {
    id: 'puzzle' as ActiveGameId,
    title: 'تركيب الصور',
    subtitle: 'بازل الحكايات',
    icon: Puzzle,
    emoji: '🧩',
    color: 'from-sky-400 to-blue-500',
    borderColor: 'border-sky-300 dark:border-sky-700',
  },
  {
    id: 'spot' as ActiveGameId,
    title: 'اكتشف الاختلافات',
    subtitle: 'قوة الملاحظة',
    icon: Search,
    emoji: '🔍',
    color: 'from-rose-400 to-pink-500',
    borderColor: 'border-rose-300 dark:border-rose-700',
  },
  {
    id: 'coloring' as ActiveGameId,
    title: 'كتاب التلوين',
    subtitle: 'لوّن واحفظ رسمتك',
    icon: Palette,
    emoji: '🎨',
    color: 'from-purple-400 to-pink-500',
    borderColor: 'border-purple-300 dark:border-purple-700',
  },
  {
    id: 'quiz' as ActiveGameId,
    title: 'تحدي الحكايات',
    subtitle: 'أسئلة وقيم أخلاقية',
    icon: Crown,
    emoji: '👑',
    color: 'from-amber-500 to-yellow-500',
    borderColor: 'border-yellow-300 dark:border-yellow-700',
  },
  {
    id: 'runner' as ActiveGameId,
    title: 'مغامرة الغابة',
    subtitle: 'اركض واجمع النجوم',
    icon: TreePine,
    emoji: '🌳',
    color: 'from-emerald-400 to-teal-500',
    borderColor: 'border-emerald-300 dark:border-emerald-700',
  },
];

export const GamesHub: React.FC<GamesHubProps> = ({
  soundEnabled,
  onPlaySound,
  defaultGameId = 'memory',
}) => {
  const [activeGame, setActiveGame] = useState<ActiveGameId>(
    (defaultGameId as ActiveGameId) || 'memory'
  );
  const [gamesSound, setGamesSound] = useState(soundEnabled);

  const selectedMeta = GAMES_CATALOG.find((g) => g.id === activeGame) || GAMES_CATALOG[0];

  return (
    <section
      id="games-world"
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-100/80 via-white to-pink-100/70 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950 p-3.5 sm:p-7 border-2 border-amber-300/80 dark:border-indigo-900/80 shadow-xl"
    >
      {/* Decorative Whimsical Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-300/30 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-300/30 dark:bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10">
        
        {/* Section Title Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-amber-200/80 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-pink-500 text-white flex items-center justify-center font-black shadow-lg text-2xl animate-float">
              🎮
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-amber-200">
                  عالم ألعاب قصة العائلة
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white animate-twinkle">
                  ٦ ألعاب ممتعة 🌟
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                ألعاب تفاعلية تعليمية وترفيهية آمنة ومسلية ومصممة خصيصاً للأطفال
              </p>
            </div>
          </div>

          {/* Sound Toggle for Games */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setGamesSound(!gamesSound)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
              title={gamesSound ? 'كتم أصوات الألعاب' : 'تشغيل أصوات الألعاب'}
            >
              {gamesSound ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>الصوت مفعّل</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                  <span>الصوت مكتوم</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 6 Game Selection Tabs with Touch Friendly Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5 mb-5">
          {GAMES_CATALOG.map((game) => {
            const isCurrent = activeGame === game.id;
            return (
              <button
                key={game.id}
                type="button"
                onClick={() => {
                  if (soundEnabled && onPlaySound) onPlaySound();
                  setActiveGame(game.id);
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border-2 transition-all duration-200 text-center cursor-pointer select-none ${
                  isCurrent
                    ? `bg-white dark:bg-slate-800 ${game.borderColor} ring-3 ring-amber-400/40 shadow-md scale-102`
                    : 'bg-white/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:bg-white hover:border-amber-300'
                }`}
              >
                <span className="text-2xl sm:text-3xl mb-1">{game.emoji}</span>
                <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 line-clamp-1">
                  {game.title}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium line-clamp-1">
                  {game.subtitle}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Game Container */}
        <div className="transition-all duration-300">
          {activeGame === 'memory' && (
            <MemoryGame soundEnabled={gamesSound} onPlaySound={onPlaySound} />
          )}
          {activeGame === 'puzzle' && (
            <PuzzleGame soundEnabled={gamesSound} onPlaySound={onPlaySound} />
          )}
          {activeGame === 'spot' && (
            <SpotDifferenceGame soundEnabled={gamesSound} onPlaySound={onPlaySound} />
          )}
          {activeGame === 'coloring' && (
            <ColoringGame soundEnabled={gamesSound} onPlaySound={onPlaySound} />
          )}
          {activeGame === 'quiz' && (
            <StoryQuizGame soundEnabled={gamesSound} onPlaySound={onPlaySound} />
          )}
          {activeGame === 'runner' && (
            <MagicForestRunner soundEnabled={gamesSound} onPlaySound={onPlaySound} />
          )}
        </div>

      </div>
    </section>
  );
};
