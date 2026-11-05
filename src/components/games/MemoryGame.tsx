import React, { useState, useEffect } from 'react';
import { RotateCcw, Trophy, Sparkles, Volume2, VolumeX, Star, Award } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MemoryGameProps {
  soundEnabled: boolean;
  onPlaySound?: () => void;
}

type Difficulty = 'easy' | 'medium' | 'hard';

interface CardItem {
  id: number;
  emoji: string;
  nameAr: string;
  matched: boolean;
}

const STORY_ITEMS = [
  { emoji: '🦊', nameAr: 'الثعلب مكرون' },
  { emoji: '👑', nameAr: 'تاج الأميرة' },
  { emoji: '⭐', nameAr: 'نجمة سحرية' },
  { emoji: '🏰', nameAr: 'قصر الحكايات' },
  { emoji: '🍎', nameAr: 'تفاحة ذهبية' },
  { emoji: '🐶', nameAr: 'الكلب بولت' },
  { emoji: '⛵', nameAr: 'سفينة السندباد' },
  { emoji: '🍭', nameAr: 'كوكب الحلوى' },
];

export const MemoryGame: React.FC<MemoryGameProps> = ({ soundEnabled, onPlaySound }) => {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Initialize Cards based on difficulty
  const startNewGame = (diff = difficulty) => {
    setDifficulty(diff);
    setIsWon(false);
    setMoves(0);
    setFlippedIndices([]);
    setIsLocked(false);

    let pairsCount = 4; // 8 cards (4x2)
    if (diff === 'medium') pairsCount = 6; // 12 cards (4x3)
    if (diff === 'hard') pairsCount = 8; // 16 cards (4x4)

    const selectedItems = STORY_ITEMS.slice(0, pairsCount);
    const deck: CardItem[] = [];

    selectedItems.forEach((item, index) => {
      deck.push({ id: index * 2, emoji: item.emoji, nameAr: item.nameAr, matched: false });
      deck.push({ id: index * 2 + 1, emoji: item.emoji, nameAr: item.nameAr, matched: false });
    });

    // Shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
  };

  useEffect(() => {
    startNewGame(difficulty);
  }, [difficulty]);

  const handleCardClick = (index: number) => {
    if (isLocked || isWon) return;
    if (flippedIndices.includes(index) || cards[index].matched) return;

    if (soundEnabled && onPlaySound) onPlaySound();

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setIsLocked(true);

      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = cards[firstIdx];
      const secondCard = cards[secondIdx];

      if (firstCard.emoji === secondCard.emoji) {
        // Matched!
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c, idx) =>
              idx === firstIdx || idx === secondIdx ? { ...c, matched: true } : c
            )
          );
          setFlippedIndices([]);
          setIsLocked(false);
        }, 500);
      } else {
        // Not matched - flip back
        setTimeout(() => {
          setFlippedIndices([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  // Check victory
  useEffect(() => {
    if (cards.length > 0 && cards.every((c) => c.matched)) {
      setIsWon(true);
      try {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
    }
  }, [cards]);

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-3 sm:p-5 bg-gradient-to-br from-amber-50 to-rose-50 dark:from-slate-900 dark:to-indigo-950 rounded-2xl sm:rounded-3xl border border-amber-200/80 dark:border-indigo-900/60 shadow-lg text-slate-800 dark:text-slate-100">
      
      {/* Game Header */}
      <div className="flex flex-wrap items-center justify-between w-full gap-2 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-900 flex items-center justify-center font-black shadow-md text-xl">
            🧠
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-800 dark:text-amber-200">
              لعبة ذاكرة الحكايات
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
              اقلب البطاقات واعثر على الصور المتطابقة!
            </p>
          </div>
        </div>

        {/* Moves & Reset */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl text-xs sm:text-sm font-black bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
            الحركات: <span className="text-rose-500 font-bold">{moves}</span>
          </span>
          <button
            type="button"
            onClick={() => startNewGame(difficulty)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-xs active:scale-95 transition cursor-pointer"
            title="إعادة بدء اللعبة"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة</span>
          </button>
        </div>
      </div>

      {/* Difficulty Switcher */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-4 w-full">
        {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => {
          const labels: Record<Difficulty, string> = {
            easy: 'سهل (٨ بطاقات)',
            medium: 'متوسط (١٢ بطاقة)',
            hard: 'بطل الحكايات (١٦ بطاقة)',
          };
          return (
            <button
              key={diff}
              type="button"
              onClick={() => startNewGame(diff)}
              className={`px-3 py-1 rounded-xl text-[11px] sm:text-xs font-black transition cursor-pointer ${
                difficulty === diff
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-white'
              }`}
            >
              {labels[diff]}
            </button>
          );
        })}
      </div>

      {/* Cards Grid */}
      <div
        className={`grid gap-2 sm:gap-3 w-full my-2 ${
          difficulty === 'easy'
            ? 'grid-cols-4 max-w-md'
            : difficulty === 'medium'
            ? 'grid-cols-4 max-w-lg'
            : 'grid-cols-4 max-w-xl'
        }`}
      >
        {cards.map((card, index) => {
          const isFlipped = flippedIndices.includes(index) || card.matched;
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => handleCardClick(index)}
              disabled={isFlipped || isLocked}
              className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 transform select-none cursor-pointer ${
                isFlipped
                  ? card.matched
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-400 text-emerald-800 dark:text-emerald-200 scale-95 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-2 border-amber-400 scale-100 shadow-md ring-2 ring-amber-300/40'
                  : 'bg-gradient-to-br from-amber-400 via-rose-400 to-pink-500 border-2 border-white/60 hover:scale-105 active:scale-95 shadow-md'
              }`}
            >
              {isFlipped ? (
                <div className="flex flex-col items-center justify-center animate-twinkle">
                  <span className="text-2xl sm:text-4xl">{card.emoji}</span>
                  <span className="text-[9px] sm:text-[10px] font-black mt-1 text-center line-clamp-1">
                    {card.nameAr}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-white/90">
                  <Star className="w-5 h-5 sm:w-7 sm:h-7 fill-white/80" />
                  <span className="text-[9px] sm:text-[10px] font-bold mt-1 text-white/90">قصة</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Victory Celebration Modal */}
      {isWon && (
        <div className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-500 text-white flex flex-col items-center gap-2 text-center shadow-xl animate-bounce-slow w-full">
          <Trophy className="w-10 h-10 fill-amber-200 animate-spin-slow" />
          <h4 className="text-lg font-black">أحسنت يا بطل الحكايات الذكي! 🎉</h4>
          <p className="text-xs font-bold">
            لقد طابقت جميع البطاقات بنجاح في {moves} حركة!
          </p>
          <button
            type="button"
            onClick={() => startNewGame(difficulty)}
            className="mt-2 px-5 py-2 rounded-xl bg-white text-slate-900 font-black text-xs hover:bg-amber-100 transition shadow-md active:scale-95 cursor-pointer"
          >
            العب مرة أخرى ↺
          </button>
        </div>
      )}
    </div>
  );
};
