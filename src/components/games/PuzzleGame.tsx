import React, { useState, useEffect } from 'react';
import { RotateCcw, Eye, Trophy, Sparkles, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface PuzzleGameProps {
  soundEnabled: boolean;
  onPlaySound?: () => void;
}

type GridSize = 3 | 4;

interface PuzzleTheme {
  id: string;
  title: string;
  emoji: string;
  bgGradient: string;
  elements: { x: number; y: number; emoji: string; text: string; bg: string }[];
}

const THEMES: PuzzleTheme[] = [
  {
    id: 'fox',
    title: 'الثعلب مكرون في الغابة',
    emoji: '🦊',
    bgGradient: 'from-amber-200 via-emerald-100 to-sky-200',
    elements: [
      { x: 0, y: 0, emoji: '☀️', text: 'شمس مشرقة', bg: 'bg-amber-300' },
      { x: 1, y: 0, emoji: '☁️', text: 'سحابة بيضاء', bg: 'bg-sky-200' },
      { x: 2, y: 0, emoji: '🐦', text: 'عصفور يغرد', bg: 'bg-sky-300' },
      { x: 0, y: 1, emoji: '🌳', text: 'شجرة تفاح', bg: 'bg-emerald-400' },
      { x: 1, y: 1, emoji: '🦊', text: 'الثعلب مكرون', bg: 'bg-orange-400' },
      { x: 2, y: 1, emoji: '🍎', text: 'تفاحة ذهبية', bg: 'bg-red-400' },
      { x: 0, y: 2, emoji: '🌸', text: 'أزهار ملونة', bg: 'bg-pink-300' },
      { x: 1, y: 2, emoji: '🍄', text: 'فطر الغابة', bg: 'bg-rose-400' },
      { x: 2, y: 2, emoji: '⭐', text: 'نجمة الحكايات', bg: 'bg-yellow-400' },
    ],
  },
  {
    id: 'princess',
    title: 'قصر الأميرات والورود',
    emoji: '🏰',
    bgGradient: 'from-pink-200 via-purple-100 to-rose-200',
    elements: [
      { x: 0, y: 0, emoji: '✨', text: 'بريق سحري', bg: 'bg-amber-200' },
      { x: 1, y: 0, emoji: '🏰', text: 'برج القصر', bg: 'bg-purple-300' },
      { x: 2, y: 0, emoji: '🕊️', text: 'حمامة السلام', bg: 'bg-sky-200' },
      { x: 0, y: 1, emoji: '👑', text: 'تاج مرصع', bg: 'bg-amber-300' },
      { x: 1, y: 1, emoji: '👸', text: 'الأميرة الجميلة', bg: 'bg-pink-400' },
      { x: 2, y: 1, emoji: '🥿', text: 'حذاء زجاجي', bg: 'bg-cyan-200' },
      { x: 0, y: 2, emoji: '🌹', text: 'حديقة الورد', bg: 'bg-rose-400' },
      { x: 1, y: 2, emoji: '🦋', text: 'فراشة لطيفة', bg: 'bg-violet-300' },
      { x: 2, y: 2, emoji: '💖', text: 'قلب المحبة', bg: 'bg-pink-400' },
    ],
  },
  {
    id: 'sindbad',
    title: 'مغامرة السندباد البحري',
    emoji: '⛵',
    bgGradient: 'from-sky-200 via-indigo-100 to-cyan-200',
    elements: [
      { x: 0, y: 0, emoji: '🧭', text: 'بوصلة السندباد', bg: 'bg-amber-300' },
      { x: 1, y: 0, emoji: '🦅', text: 'طائر الرخ', bg: 'bg-sky-300' },
      { x: 2, y: 0, emoji: '🗺️', text: 'خريطة الكنز', bg: 'bg-amber-200' },
      { x: 0, y: 1, emoji: '⛵', text: 'سفينة المغامرة', bg: 'bg-orange-300' },
      { x: 1, y: 1, emoji: '🐳', text: 'الحوت العملاق', bg: 'bg-indigo-400' },
      { x: 2, y: 1, emoji: '🏝️', text: 'جزيرة الأسرار', bg: 'bg-emerald-300' },
      { x: 0, y: 2, emoji: '🌊', text: 'أمواج البحر', bg: 'bg-cyan-400' },
      { x: 1, y: 2, emoji: '💎', text: 'جوهرة نادرة', bg: 'bg-teal-300' },
      { x: 2, y: 2, emoji: '🪙', text: 'عملات ذهبية', bg: 'bg-yellow-400' },
    ],
  },
];

export const PuzzleGame: React.FC<PuzzleGameProps> = ({ soundEnabled, onPlaySound }) => {
  const [themeIndex, setThemeIndex] = useState(0);
  const [gridSize, setGridSize] = useState<GridSize>(3);
  const [tiles, setTiles] = useState<number[]>([]);
  const [selectedTileIndex, setSelectedTileIndex] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  const [isWon, setIsWon] = useState(false);

  const currentTheme = THEMES[themeIndex];
  const totalTiles = gridSize * gridSize;

  // Start / Reset Puzzle
  const initPuzzle = (size = gridSize, themeIdx = themeIndex) => {
    setGridSize(size);
    setThemeIndex(themeIdx);
    setMoves(0);
    setIsWon(false);
    setSelectedTileIndex(null);

    const count = size * size;
    // Generate solved indices 0 .. count-1
    const initial = Array.from({ length: count }, (_, i) => i);

    // Shuffle tiles
    let shuffled = [...initial];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    // Ensure it's not already solved
    if (shuffled.every((val, idx) => val === idx)) {
      [shuffled[0], shuffled[1]] = [shuffled[1], shuffled[0]];
    }

    setTiles(shuffled);
  };

  useEffect(() => {
    initPuzzle(gridSize, themeIndex);
  }, [gridSize, themeIndex]);

  // Handle Tile Click / Tap to Swap
  const handleTileClick = (index: number) => {
    if (isWon) return;

    if (selectedTileIndex === null) {
      // First tile selected
      if (soundEnabled && onPlaySound) onPlaySound();
      setSelectedTileIndex(index);
    } else {
      // Second tile selected -> Swap!
      if (soundEnabled && onPlaySound) onPlaySound();
      const newTiles = [...tiles];
      const temp = newTiles[selectedTileIndex];
      newTiles[selectedTileIndex] = newTiles[index];
      newTiles[index] = temp;

      setTiles(newTiles);
      setSelectedTileIndex(null);
      setMoves((m) => m + 1);

      // Check win condition
      if (newTiles.every((val, idx) => val === idx)) {
        setIsWon(true);
        try {
          confetti({
            particleCount: 60,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch {}
      }
    }
  };

  // Helper to render piece content
  const renderPieceContent = (pieceIdx: number) => {
    // For 3x3, use elements directly
    const elem = currentTheme.elements[pieceIdx % currentTheme.elements.length];
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center p-1 rounded-xl text-center select-none ${elem.bg} text-slate-900 shadow-inner`}>
        <span className="text-2xl sm:text-3xl">{elem.emoji}</span>
        <span className="text-[9px] sm:text-[10px] font-black line-clamp-1 mt-0.5 opacity-90">
          {elem.text}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-3 sm:p-5 bg-gradient-to-br from-sky-50 to-amber-50 dark:from-slate-900 dark:to-slate-950 rounded-2xl sm:rounded-3xl border border-sky-200/80 dark:border-slate-800 shadow-lg text-slate-800 dark:text-slate-100">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between w-full gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-sky-400 text-slate-950 flex items-center justify-center font-black shadow-md text-xl">
            🧩
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-sky-200">
              لعبة تركيب صور الحكايات
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
              اضغط على قطعتين لتبديل مكانهما وترتيب الصورة!
            </p>
          </div>
        </div>

        {/* Moves & Action buttons */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl text-xs sm:text-sm font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
            الحركات: <span className="text-rose-500 font-bold">{moves}</span>
          </span>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs ${
              showPreview ? 'bg-sky-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
            }`}
            title="معاينة الصورة الأصلية"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>معاينة</span>
          </button>
          <button
            type="button"
            onClick={() => initPuzzle(gridSize, themeIndex)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-2xs transition cursor-pointer"
            title="إعادة الترتيب"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة</span>
          </button>
        </div>
      </div>

      {/* Theme Selection */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-3 w-full">
        {THEMES.map((th, idx) => (
          <button
            key={th.id}
            type="button"
            onClick={() => initPuzzle(gridSize, idx)}
            className={`px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black transition cursor-pointer flex items-center gap-1.5 ${
              themeIndex === idx
                ? 'bg-sky-600 text-white shadow-md'
                : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-white'
            }`}
          >
            <span>{th.emoji}</span>
            <span>{th.title}</span>
          </button>
        ))}
      </div>

      {/* Grid Size Switcher */}
      <div className="flex items-center justify-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => initPuzzle(3, themeIndex)}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
            gridSize === 3
              ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
              : 'bg-white/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          ٣ × ٣ (سهل للأطفال)
        </button>
        <button
          type="button"
          onClick={() => initPuzzle(4, themeIndex)}
          className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
            gridSize === 4
              ? 'bg-amber-400 text-slate-950 font-black shadow-xs'
              : 'bg-white/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
          }`}
        >
          ٤ × ٤ (تحدي الأذكياء)
        </button>
      </div>

      {/* Preview Box if toggled */}
      {showPreview && (
        <div className="mb-3 p-3 rounded-2xl bg-amber-100 dark:bg-slate-800 border border-amber-300 dark:border-slate-700 text-center animate-twinkle">
          <p className="text-xs font-black text-amber-900 dark:text-amber-200 mb-2">
            هكذا يجب أن تبدو الصورة بعد ترتيبها:
          </p>
          <div className="grid grid-cols-3 gap-1.5 max-w-xs mx-auto">
            {currentTheme.elements.map((elem, idx) => (
              <div key={idx} className={`p-2 rounded-lg ${elem.bg} text-slate-900 text-center`}>
                <span className="text-xl">{elem.emoji}</span>
                <span className="block text-[8px] font-black">{elem.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Puzzle Board */}
      <div
        className={`grid gap-2 p-3 rounded-2xl bg-white/70 dark:bg-slate-800/80 border-2 border-dashed border-sky-300 dark:border-slate-700 w-full max-w-md ${
          gridSize === 3 ? 'grid-cols-3' : 'grid-cols-4'
        }`}
      >
        {tiles.map((pieceIdx, tilePosition) => {
          const isSelected = selectedTileIndex === tilePosition;
          const isCorrect = pieceIdx === tilePosition;

          return (
            <button
              key={tilePosition}
              type="button"
              onClick={() => handleTileClick(tilePosition)}
              className={`aspect-square relative rounded-xl overflow-hidden transition-all duration-200 cursor-pointer p-1 ${
                isSelected
                  ? 'ring-4 ring-rose-500 scale-95 shadow-lg z-10'
                  : 'hover:scale-[1.03] active:scale-95'
              } ${isCorrect && !isWon ? 'border border-emerald-400' : ''}`}
            >
              {renderPieceContent(pieceIdx)}

              {/* Number guide */}
              <span className="absolute top-1.5 left-1.5 w-4 h-4 rounded-full bg-black/60 text-white text-[9px] font-bold flex items-center justify-center">
                {tilePosition + 1}
              </span>

              {isCorrect && !isWon && (
                <span className="absolute bottom-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-white text-[9px] flex items-center justify-center">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Victory Celebration */}
      {isWon && (
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white flex flex-col items-center gap-2 text-center shadow-xl animate-bounce-slow w-full">
          <Trophy className="w-10 h-10 fill-amber-200 animate-spin-slow" />
          <h4 className="text-lg font-black">ما شاء الله! رتبت الصورة بنجاح! 🌟</h4>
          <p className="text-xs font-bold">
            أكملت تركيب «{currentTheme.title}» في {moves} حركة فقط!
          </p>
          <button
            type="button"
            onClick={() => initPuzzle(gridSize, (themeIndex + 1) % THEMES.length)}
            className="mt-2 px-5 py-2 rounded-xl bg-white text-slate-900 font-black text-xs hover:bg-emerald-100 transition shadow-md active:scale-95 cursor-pointer"
          >
            المشهد التالي ➔
          </button>
        </div>
      )}
    </div>
  );
};
