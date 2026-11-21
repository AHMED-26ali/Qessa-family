import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { GameSurface, type ActiveGameId } from './GameSurface';

interface GamesHubProps {
  soundEnabled: boolean;
  onPlaySound?: () => void;
}

const GAMES_CATALOG = [
  {
    id: 'memory' as ActiveGameId,
    title: 'لعبة الذاكرة',
    subtitle: 'مطابقة البطاقات',
    emoji: '🧠',
    borderColor: 'border-amber-300 dark:border-amber-700',
  },
  {
    id: 'puzzle' as ActiveGameId,
    title: 'تركيب الصور',
    subtitle: 'بازل الحكايات',
    emoji: '🧩',
    borderColor: 'border-sky-300 dark:border-sky-700',
  },
  {
    id: 'spot' as ActiveGameId,
    title: 'اكتشف الاختلافات',
    subtitle: 'قوة الملاحظة',
    emoji: '🔍',
    borderColor: 'border-rose-300 dark:border-rose-700',
  },
  {
    id: 'coloring' as ActiveGameId,
    title: 'كتاب التلوين',
    subtitle: 'لوّن واحفظ رسمتك',
    emoji: '🎨',
    borderColor: 'border-purple-300 dark:border-purple-700',
  },
  {
    id: 'quiz' as ActiveGameId,
    title: 'تحدي الحكايات',
    subtitle: 'أسئلة وقيم أخلاقية',
    emoji: '👑',
    borderColor: 'border-yellow-300 dark:border-yellow-700',
  },
  {
    id: 'runner' as ActiveGameId,
    title: 'مغامرة الغابة',
    subtitle: 'اركض واجمع النجوم',
    emoji: '🌳',
    borderColor: 'border-emerald-300 dark:border-emerald-700',
  },
  {
    id: 'count' as ActiveGameId,
    title: 'عُدّ الأشكال',
    subtitle: 'تدرّب على العد',
    emoji: '⭐',
    borderColor: 'border-amber-300 dark:border-amber-700',
  },
  {
    id: 'pattern' as ActiveGameId,
    title: 'كمّل النمط',
    subtitle: 'اختار الشكل اللي بعده',
    emoji: '🌙',
    borderColor: 'border-indigo-300 dark:border-indigo-700',
  },
];

export const GamesHub: React.FC<GamesHubProps> = ({
  soundEnabled,
  onPlaySound,
}) => {
  const [activeGame, setActiveGame] = useState<ActiveGameId | null>(null);
  const [gameSoundOff, setGameSoundOff] = useState(false);
  const gamesSound = soundEnabled && !gameSoundOff;
  const toggleGamesSound = () => setGameSoundOff((previous) => !previous);

  return (
    <section
      id="games-world"
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-100/80 via-white to-pink-100/70 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950 p-3.5 sm:p-7 border-2 border-amber-300/80 dark:border-indigo-900/80 shadow-xl"
    >

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
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                اختار لعبة وابدأ
              </p>
            </div>
          </div>

          {/* Sound Toggle for Games */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleGamesSound}
              disabled={!soundEnabled}
              aria-pressed={gamesSound}
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

        {/* Game selection */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 mb-5">
          {GAMES_CATALOG.map((game) => {
            const isCurrent = activeGame === game.id;
            return (
              <button
                key={game.id}
                type="button"
                aria-pressed={isCurrent}
                onClick={() => {
                  if (gamesSound) onPlaySound?.();
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

        {activeGame && <GameSurface id={activeGame} soundEnabled={gamesSound} onPlaySound={onPlaySound} />}

      </div>
    </section>
  );
};
