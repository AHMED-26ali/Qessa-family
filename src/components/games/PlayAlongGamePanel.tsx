import React, { useState } from 'react';
import { Gamepad2, X, ChevronDown, ChevronUp, Sparkles, VolumeX, Maximize2 } from 'lucide-react';
import { MemoryGame } from './MemoryGame';
import { PuzzleGame } from './PuzzleGame';
import { SpotDifferenceGame } from './SpotDifferenceGame';
import { ColoringGame } from './ColoringGame';
import { StoryQuizGame } from './StoryQuizGame';
import { MagicForestRunner } from './MagicForestRunner';
import { ActiveGameId } from './GamesHub';

interface PlayAlongGamePanelProps {
  isOpen: boolean;
  onClose: () => void;
  isVideoPlaying: boolean;
  onOpenFullGamesHub: () => void;
}

const MINI_GAMES_TABS = [
  { id: 'memory' as ActiveGameId, name: 'الذاكرة', emoji: '🧠' },
  { id: 'puzzle' as ActiveGameId, name: 'التركيب', emoji: '🧩' },
  { id: 'spot' as ActiveGameId, name: 'الاختلافات', emoji: '🔍' },
  { id: 'coloring' as ActiveGameId, name: 'التلوين', emoji: '🎨' },
  { id: 'quiz' as ActiveGameId, name: 'التحدي', emoji: '👑' },
  { id: 'runner' as ActiveGameId, name: 'الغابة', emoji: '🌳' },
];

export const PlayAlongGamePanel: React.FC<PlayAlongGamePanelProps> = ({
  isOpen,
  onClose,
  isVideoPlaying,
  onOpenFullGamesHub,
}) => {
  const [activeTab, setActiveTab] = useState<ActiveGameId>('memory');

  if (!isOpen) return null;

  return (
    <div className="w-full rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-slate-900/95 border-2 border-amber-300 dark:border-indigo-900 shadow-xl overflow-hidden p-3 sm:p-4 flex flex-col gap-3">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎮</span>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-slate-800 dark:text-amber-200">
              اللعب أثناء مشاهدة القصة
            </h4>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
              <VolumeX className="w-3 h-3 text-amber-500" />
              <span>الصوت مكتوم تلقائياً للاستماع للقصة</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenFullGamesHub}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 hover:bg-amber-200 transition cursor-pointer"
            title="الانتقال إلى عالم الألعاب الكامل"
          >
            <Maximize2 className="w-3 h-3" />
            <span className="hidden xs:inline">عالم الألعاب</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 transition cursor-pointer"
            title="إغلاق لوحة اللعب"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mini Game Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {MINI_GAMES_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1 rounded-xl text-xs font-black shrink-0 transition flex items-center gap-1 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-rose-500 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <span>{tab.emoji}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Active Game Embedded with Sound Off by Default */}
      <div className="w-full max-h-[500px] overflow-y-auto">
        {activeTab === 'memory' && <MemoryGame soundEnabled={false} />}
        {activeTab === 'puzzle' && <PuzzleGame soundEnabled={false} />}
        {activeTab === 'spot' && <SpotDifferenceGame soundEnabled={false} />}
        {activeTab === 'coloring' && <ColoringGame soundEnabled={false} />}
        {activeTab === 'quiz' && <StoryQuizGame soundEnabled={false} />}
        {activeTab === 'runner' && <MagicForestRunner soundEnabled={false} />}
      </div>
    </div>
  );
};
